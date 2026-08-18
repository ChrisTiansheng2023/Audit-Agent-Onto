import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the enterprise tax agent platform", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /财务智能体/);
  assert.match(html, /企业财税 Agent 平台/);
  assert.match(html, /集团税务健康度/);
  assert.match(html, /智能体中心/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("exposes platform metadata API", async () => {
  const response = await render("/api/platform");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.tenant.name, "华夏实业集团");
  assert.ok(payload.agents.length >= 6);
  assert.equal(payload.runtime.approvalPolicy, "risk-based");
});

