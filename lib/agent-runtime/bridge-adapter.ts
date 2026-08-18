import type { AgentRuntimeAdapter, RuntimeEvent, RuntimeRequest } from "./types";

export class BridgeRuntimeAdapter implements AgentRuntimeAdapter {
  constructor(private readonly bridgeUrl: string) {}

  async *run(input: RuntimeRequest): AsyncIterable<RuntimeEvent> {
    const response = await fetch(`${this.bridgeUrl.replace(/\/$/, "")}/v1/runs`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Codex bridge returned ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame.split("\n").find((entry) => entry.startsWith("data:"));
        if (!line) continue;
        yield JSON.parse(line.slice(5).trim()) as RuntimeEvent;
      }
    }
  }
}

