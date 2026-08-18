export type RuntimeRequest = {
  prompt: string;
  agentId: string;
  tenantId?: string;
  threadId?: string;
  approvalMode?: "auto" | "risk-based" | "manual";
};

export type RuntimeEvent = {
  type: string;
  at: string;
  runId?: string;
  threadId?: string;
  itemId?: string;
  title?: string;
  content?: string;
  status?: string;
  meta?: Record<string, string | number | boolean>;
};

export interface AgentRuntimeAdapter {
  run(input: RuntimeRequest): AsyncIterable<RuntimeEvent>;
}

