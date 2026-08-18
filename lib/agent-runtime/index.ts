import { BridgeRuntimeAdapter } from "./bridge-adapter";
import { DemoRuntimeAdapter } from "./demo-adapter";
import type { AgentRuntimeAdapter } from "./types";

export function createRuntimeAdapter(): AgentRuntimeAdapter {
  const mode = process.env.AGENT_RUNTIME_MODE ?? "demo";
  const bridgeUrl = process.env.CODEX_BRIDGE_URL;

  if (mode === "bridge" && bridgeUrl) {
    return new BridgeRuntimeAdapter(bridgeUrl);
  }

  return new DemoRuntimeAdapter();
}

export type { RuntimeEvent, RuntimeRequest } from "./types";

