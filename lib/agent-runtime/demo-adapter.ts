import type { AgentRuntimeAdapter, RuntimeEvent, RuntimeRequest } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isoTime() {
  return new Date().toISOString();
}

function buildFinding(prompt: string) {
  if (/发票|进项|销项/.test(prompt)) {
    return {
      summary: "已完成发票与账务链路复核，发现 3 类需要关注的异常。",
      findings: [
        "12 张进项发票的货物名称与采购订单品类存在偏差，涉及价税合计 286,400 元。",
        "2 家供应商近 30 天开票频次显著上升，建议核对业务实质与验收记录。",
        "1 张红字发票尚未在应付模块完成冲销，可能导致本期进项税额多计 8,721.36 元。",
      ],
      advice: "建议先冻结争议发票的抵扣状态，由税务会计复核合同、入库单与付款流水；确认后再执行账务调整。",
    };
  }

  if (/所得税|研发|加计扣除/.test(prompt)) {
    return {
      summary: "已按企业所得税预审口径完成纳税调整与优惠条件匹配。",
      findings: [
        "研发人员工时归集完整度为 93.6%，仍有 4 个项目缺少跨部门工时分摊依据。",
        "检测费中 184,600 元尚未关联研发项目立项书，暂不建议计入加计扣除基数。",
        "业务招待费账载金额与申报底稿存在 32,800 元差异。",
      ],
      advice: "先补齐立项、工时和费用归属证据，再由税务负责人确认调整金额并生成申报底稿。",
    };
  }

  return {
    summary: "已完成集团财税风险扫描，并按影响金额与合规概率完成分级。",
    findings: [
      "华东区本期增值税税负率较近 12 个月均值下降 0.46 个百分点。",
      "未开票收入与合同履约台账存在 2 笔跨期差异，合计 418,000 元。",
      "当前 6 个申报主体中有 2 个主体的账税勾稽尚未闭环。",
    ],
    advice: "建议优先复核跨期收入与未开票收入，并在申报锁定前完成责任人确认。",
  };
}

export class DemoRuntimeAdapter implements AgentRuntimeAdapter {
  async *run(input: RuntimeRequest): AsyncIterable<RuntimeEvent> {
    const runId = `RUN-${Math.floor(8200 + Math.random() * 700)}`;
    const threadId = input.threadId ?? `thr_tax_${crypto.randomUUID().slice(0, 8)}`;
    const finding = buildFinding(input.prompt);

    yield { type: "run.started", at: isoTime(), runId, threadId, title: "任务已进入安全运行环境", status: "running" };
    await sleep(280);
    yield { type: "item.started", at: isoTime(), runId, threadId, itemId: "ctx", title: "装载企业上下文", content: "华夏实业集团 / 2026 年 7 月 / 集团合并口径" };
    await sleep(420);
    yield { type: "item.completed", at: isoTime(), runId, threadId, itemId: "policy", title: "权限与策略校验", content: "租户隔离、字段级权限、只读工具策略均已通过", status: "completed" };
    await sleep(460);
    yield { type: "item.completed", at: isoTime(), runId, threadId, itemId: "knowledge", title: "检索法规与企业制度", content: "命中 18 条有效依据，已排除 3 条失效口径", status: "completed", meta: { sources: 18 } };
    await sleep(520);
    yield { type: "item.completed", at: isoTime(), runId, threadId, itemId: "tool", title: "调用财税工具", content: "完成发票、总账、申报表及合同台账的交叉校验", status: "completed", meta: { toolCalls: 7 } };
    await sleep(480);
    yield { type: "item.completed", at: isoTime(), runId, threadId, itemId: "reason", title: "生成风险判断", content: "按金额影响、证据完整度与政策效力进行分级", status: "completed" };

    const markdown = [
      `### ${finding.summary}`,
      "",
      ...finding.findings.map((item, index) => `${index + 1}. ${item}`),
      "",
      `**处置建议：** ${finding.advice}`,
      "",
      "本结果由演示运行时生成，正式申报或账务处理前必须由具备权限的财税人员复核。",
    ].join("\n");

    const chunks = markdown.match(/.{1,34}/gs) ?? [markdown];
    for (const chunk of chunks) {
      await sleep(38);
      yield { type: "message.delta", at: isoTime(), runId, threadId, content: chunk };
    }

    yield {
      type: "run.completed",
      at: isoTime(),
      runId,
      threadId,
      title: "分析完成，等待业务复核",
      status: "completed",
      meta: { inputTokens: 12840, outputTokens: 1642, durationMs: 2840, confidence: 94.6 },
    };
  }
}

