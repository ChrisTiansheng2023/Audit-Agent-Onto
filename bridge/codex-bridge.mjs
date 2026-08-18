#!/usr/bin/env node

/**
 * Local Codex App Server bridge.
 *
 * This optional service turns the Codex JSON-RPC/JSONL protocol into an HTTP
 * SSE endpoint consumed by the web platform. It deliberately starts threads
 * in a read-only sandbox with approvalPolicy=never. Production deployments
 * should put an authenticated approval broker in front of any write-capable
 * runtime instead of weakening these defaults.
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const port = Number(process.env.CODEX_BRIDGE_PORT ?? 8788);
const host = process.env.CODEX_BRIDGE_HOST ?? "127.0.0.1";
const codexBin = process.env.CODEX_BIN ?? "codex";
const workspaceRoot = resolve(process.env.CODEX_WORKSPACE_ROOT ?? process.cwd());
const allowedOrigin = process.env.PLATFORM_ALLOWED_ORIGIN ?? "http://localhost:3000";

class CodexAppServer {
  constructor() {
    this.sequence = 0;
    this.pending = new Map();
    this.listeners = new Set();
    this.buffer = "";
    this.ready = false;
    this.process = null;
  }

  async start() {
    if (this.process) return;
    this.process = spawn(codexBin, ["app-server", "--listen", "stdio://"], {
      cwd: workspaceRoot,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, LOG_FORMAT: "json" },
    });

    this.process.stdout.setEncoding("utf8");
    this.process.stdout.on("data", (chunk) => this.onStdout(chunk));
    this.process.stderr.setEncoding("utf8");
    this.process.stderr.on("data", (chunk) => process.stderr.write(`[codex] ${chunk}`));
    this.process.on("exit", (code) => {
      this.ready = false;
      this.process = null;
      for (const { reject } of this.pending.values()) reject(new Error(`Codex app-server exited with code ${code}`));
      this.pending.clear();
    });

    await this.request("initialize", {
      clientInfo: { name: "taxmind_web_bridge", title: "TaxMind Enterprise Agent Platform", version: "0.1.0" },
      capabilities: { experimentalApi: false },
    });
    this.notify("initialized");
    this.ready = true;
  }

  onStdout(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try { message = JSON.parse(line); } catch { continue; }

      if (message.id !== undefined && !message.method) {
        const waiter = this.pending.get(message.id);
        if (!waiter) continue;
        this.pending.delete(message.id);
        if (message.error) waiter.reject(new Error(message.error.message ?? "Codex request failed"));
        else waiter.resolve(message.result);
        continue;
      }

      if (message.id !== undefined && message.method) {
        // The default bridge is read-only, so approval prompts should not
        // normally occur. Fail closed if a future server still sends one.
        this.write({ id: message.id, result: { decision: "decline" } });
      }

      for (const listener of this.listeners) listener(message);
    }
  }

  write(message) {
    if (!this.process?.stdin.writable) throw new Error("Codex app-server is unavailable");
    this.process.stdin.write(`${JSON.stringify(message)}\n`);
  }

  request(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, 30_000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolvePromise(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.write({ method, id, params });
    });
  }

  notify(method, params = {}) { this.write({ method, params }); }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
}

const codex = new CodexAppServer();

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": allowedOrigin, vary: "origin" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function mapNotification(message, runId) {
  const params = message.params ?? {};
  const item = params.item ?? {};
  const base = { at: new Date().toISOString(), runId, threadId: params.threadId };
  if (message.method === "turn/started") return { ...base, type: "run.started", title: "Codex Turn 已启动", status: "running" };
  if (message.method === "item/started") return { ...base, type: "item.started", itemId: item.id, title: item.type ?? "Agent 行动", content: item.command ?? item.name ?? "执行中" };
  if (message.method === "item/completed") return { ...base, type: "item.completed", itemId: item.id, title: item.type ?? "Agent 行动", content: item.output ?? item.text ?? item.status ?? "已完成", status: item.status ?? "completed" };
  if (message.method === "item/agentMessage/delta") return { ...base, type: "message.delta", content: params.delta ?? "" };
  if (message.method === "turn/completed") return { ...base, type: "run.completed", title: "Codex Turn 已完成", status: params.turn?.status ?? "completed", meta: params.turn?.usage ?? {} };
  return null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": allowedOrigin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,accept",
      vary: "origin",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, codex.ready ? 200 : 503, { ready: codex.ready, workspaceRoot, sandbox: "readOnly" });
    return;
  }

  if (request.method !== "POST" || url.pathname !== "/v1/runs") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readJson(request);
    if (!body.prompt || !body.agentId) {
      sendJson(response, 422, { error: "prompt and agentId are required" });
      return;
    }
    await codex.start();
    response.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "access-control-allow-origin": allowedOrigin,
      vary: "origin",
    });
    const runId = `RUN-CODEX-${Date.now()}`;
    const emit = (event) => response.write(`data: ${JSON.stringify(event)}\n\n`);
    const threadResult = await codex.request("thread/start", {
      cwd: workspaceRoot,
      approvalPolicy: "never",
      sandbox: "readOnly",
      serviceName: "taxmind_web_bridge",
    });
    const threadId = threadResult.thread.id;
    emit({ type: "run.started", at: new Date().toISOString(), runId, threadId, title: "已建立 Codex Thread", status: "running" });

    const unsubscribe = codex.subscribe((message) => {
      if (message.params?.threadId !== threadId) return;
      const event = mapNotification(message, runId);
      if (!event) return;
      emit(event);
      if (event.type === "run.completed") { unsubscribe(); response.end(); }
    });
    request.on("close", unsubscribe);
    await codex.request("turn/start", {
      threadId,
      input: [{ type: "text", text: String(body.prompt).slice(0, 12_000) }],
    });
  } catch (error) {
    if (!response.headersSent) sendJson(response, 500, { error: error instanceof Error ? error.message : "Bridge failure" });
    else { response.write(`data: ${JSON.stringify({ type: "run.failed", at: new Date().toISOString(), status: "failed", content: error instanceof Error ? error.message : "Bridge failure" })}\n\n`); response.end(); }
  }
});

server.listen(port, host, () => {
  process.stdout.write(`TaxMind Codex bridge listening on http://${host}:${port}\n`);
  process.stdout.write(`Workspace: ${workspaceRoot}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => { codex.process?.kill(signal); server.close(() => process.exit(0)); });
}

