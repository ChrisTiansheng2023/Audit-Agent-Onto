import { agents, approvalItems, auditEvents, knowledgeSources, recentRuns, tools } from "@/lib/platform-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    tenant: { id: "tenant-huaxia", name: "华夏实业集团", region: "中国大陆" },
    runtime: {
      mode: process.env.AGENT_RUNTIME_MODE ?? "demo",
      protocol: "Codex Thread / Turn / Item compatible",
      approvalPolicy: "risk-based",
      sandbox: "workspace-write",
    },
    agents,
    runs: recentRuns,
    approvals: approvalItems,
    knowledgeSources,
    tools,
    auditEvents,
  });
}

