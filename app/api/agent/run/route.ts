import { createRuntimeAdapter, type RuntimeRequest } from "@/lib/agent-runtime";

export const dynamic = "force-dynamic";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let input: RuntimeRequest;

  try {
    input = (await request.json()) as RuntimeRequest;
  } catch {
    return Response.json({ error: "请求体必须为 JSON" }, { status: 400 });
  }

  if (!input.prompt?.trim() || !input.agentId?.trim()) {
    return Response.json({ error: "prompt 和 agentId 不能为空" }, { status: 422 });
  }

  const adapter = createRuntimeAdapter();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of adapter.run({
          ...input,
          prompt: input.prompt.slice(0, 12000),
          tenantId: input.tenantId ?? "tenant-huaxia",
          approvalMode: input.approvalMode ?? "risk-based",
        })) {
          controller.enqueue(encoder.encode(sse(event)));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            sse({
              type: "run.failed",
              at: new Date().toISOString(),
              status: "failed",
              content: error instanceof Error ? error.message : "Agent 运行失败",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

