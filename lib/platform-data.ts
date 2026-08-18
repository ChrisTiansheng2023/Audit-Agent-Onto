export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type AgentDefinition = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  domain: string;
  status: "运行中" | "草稿" | "维护中";
  tone: StatusTone;
  version: string;
  runs: string;
  accuracy: string;
  latency: string;
  tools: number;
  knowledge: number;
  color: string;
};

export const agents: AgentDefinition[] = [
  {
    id: "vat-risk",
    name: "税务合规智能体",
    shortName: "增",
    description: "识别进销项异常、税负偏离与发票链路风险，生成可复核的处置建议。",
    domain: "税务风控",
    status: "运行中",
    tone: "success",
    version: "v3.6",
    runs: "1,286",
    accuracy: "96.8%",
    latency: "18s",
    tools: 8,
    knowledge: 12,
    color: "#2f6bff",
  },
  {
    id: "invoice-audit",
    name: "发票合规智能体",
    shortName: "票",
    description: "对进项发票进行真伪、抬头、税率、业务实质及重复报销多维审核。",
    domain: "票税管理",
    status: "运行中",
    tone: "success",
    version: "v2.9",
    runs: "8,492",
    accuracy: "98.1%",
    latency: "4.2s",
    tools: 11,
    knowledge: 8,
    color: "#07a582",
  },
  {
    id: "cit-advisor",
    name: "所得税汇算清缴智能体",
    shortName: "企",
    description: "完成纳税调整识别、优惠匹配、研发加计扣除底稿核验与申报复核。",
    domain: "税务筹划",
    status: "运行中",
    tone: "success",
    version: "v2.4",
    runs: "683",
    accuracy: "94.7%",
    latency: "31s",
    tools: 7,
    knowledge: 16,
    color: "#7c5ce7",
  },
  {
    id: "close-copilot",
    name: "月结智能体",
    shortName: "结",
    description: "跨账套检查结账前置事项、定位勾稽差异并协调责任人闭环。",
    domain: "财务核算",
    status: "维护中",
    tone: "warning",
    version: "v1.8",
    runs: "956",
    accuracy: "92.3%",
    latency: "42s",
    tools: 14,
    knowledge: 6,
    color: "#e89a28",
  },
  {
    id: "policy-qa",
    name: "财税政策问答智能体",
    shortName: "策",
    description: "基于有效法规与企业制度回答财税问题，逐条返回效力、地区和引用依据。",
    domain: "政策咨询",
    status: "运行中",
    tone: "success",
    version: "v4.1",
    runs: "3,724",
    accuracy: "97.2%",
    latency: "7.8s",
    tools: 5,
    knowledge: 24,
    color: "#0d88c7",
  },
  {
    id: "expense-control",
    name: "费用审核智能体",
    shortName: "费",
    description: "结合预算、制度、合同与票据识别超标、拆单、敏感支出和关联交易。",
    domain: "费用管理",
    status: "草稿",
    tone: "neutral",
    version: "v0.7",
    runs: "128",
    accuracy: "89.6%",
    latency: "12s",
    tools: 9,
    knowledge: 10,
    color: "#d9576b",
  },
];

export const recentRuns = [
  { id: "RUN-08214", agent: "发票合规智能体", task: "华东区 7 月进项发票批量复核", owner: "王璐", time: "10:42", duration: "4分18秒", status: "已完成", tone: "success" as StatusTone },
  { id: "RUN-08213", agent: "税务合规智能体", task: "集团税负率异常波动归因", owner: "陈经理", time: "10:31", duration: "执行中", status: "运行中", tone: "info" as StatusTone },
  { id: "RUN-08212", agent: "所得税汇算清缴智能体", task: "研发费用加计扣除底稿预审", owner: "周凯", time: "09:58", duration: "12分06秒", status: "待复核", tone: "warning" as StatusTone },
  { id: "RUN-08211", agent: "财税政策问答智能体", task: "跨境服务增值税政策适用判断", owner: "林倩", time: "09:27", duration: "36秒", status: "已完成", tone: "success" as StatusTone },
  { id: "RUN-08210", agent: "月结智能体", task: "7 月关账前勾稽关系检查", owner: "赵诚", time: "昨天", duration: "8分41秒", status: "已阻断", tone: "danger" as StatusTone },
];

export const approvalItems = [
  { id: "APR-1942", title: "导出研发费用加计扣除明细", agent: "所得税汇算清缴智能体", risk: "数据导出", requester: "周凯", deadline: "11:30", tone: "warning" as StatusTone },
  { id: "APR-1941", title: "调用 ERP 创建暂估调整凭证", agent: "月结智能体", risk: "写入业务系统", requester: "赵诚", deadline: "12:00", tone: "danger" as StatusTone },
  { id: "APR-1938", title: "读取华南区合同附件", agent: "费用审核智能体", risk: "敏感数据", requester: "孙萌", deadline: "今天", tone: "info" as StatusTone },
];

export const knowledgeSources = [
  { name: "国家税务总局政策法规库", type: "法规库", docs: "18,642", chunks: "126.8 万", updated: "2 小时前", coverage: 98, status: "已同步", tone: "success" as StatusTone },
  { name: "集团财税制度与操作手册", type: "企业制度", docs: "1,286", chunks: "9.4 万", updated: "昨天 23:10", coverage: 92, status: "已同步", tone: "success" as StatusTone },
  { name: "历史税务稽查与争议案例", type: "案例库", docs: "4,315", chunks: "31.2 万", updated: "8 月 1 日", coverage: 86, status: "增量索引", tone: "info" as StatusTone },
  { name: "财务共享中心知识手册", type: "SOP", docs: "764", chunks: "5.8 万", updated: "7 月 30 日", coverage: 94, status: "已同步", tone: "success" as StatusTone },
  { name: "地方法规与口径汇编", type: "地区政策", docs: "7,808", chunks: "54.1 万", updated: "7 月 29 日", coverage: 78, status: "12 条待处理", tone: "warning" as StatusTone },
];

export const tools = [
  { name: "金税发票查验", icon: "票", category: "税务服务", description: "发票真伪、状态与抵扣信息查询", status: "健康", latency: "286ms", calls: "12.6万", tone: "success" as StatusTone },
  { name: "用友 BIP 总账", icon: "账", category: "ERP", description: "余额、凭证、科目及辅助核算查询", status: "健康", latency: "412ms", calls: "8.2万", tone: "success" as StatusTone },
  { name: "税负率计算器", icon: "算", category: "财税工具", description: "分行业、期间与主体计算税负指标", status: "健康", latency: "18ms", calls: "6.8万", tone: "success" as StatusTone },
  { name: "合同条款解析", icon: "合", category: "文档智能", description: "抽取涉税条款、金额、履约与开票条件", status: "健康", latency: "1.2s", calls: "3.1万", tone: "success" as StatusTone },
  { name: "企业工商信息", icon: "企", category: "外部数据", description: "主体登记、关联关系与风险信息核验", status: "限流", latency: "2.8s", calls: "2.4万", tone: "warning" as StatusTone },
  { name: "电子档案中心", icon: "档", category: "内容管理", description: "凭证、合同、发票与底稿安全访问", status: "健康", latency: "630ms", calls: "9.7万", tone: "success" as StatusTone },
  { name: "SAP S/4HANA", icon: "S", category: "ERP", description: "多账套财务与业务单据只读访问", status: "维护", latency: "—", calls: "4.5万", tone: "neutral" as StatusTone },
  { name: "申报表校验器", icon: "报", category: "财税工具", description: "表内、表间及账税勾稽规则校验", status: "健康", latency: "92ms", calls: "5.9万", tone: "success" as StatusTone },
];

export const auditEvents = [
  { time: "10:42:18", event: "agent.run.completed", actor: "发票合规智能体", object: "RUN-08214", tenant: "华东事业群", result: "成功", hash: "a61f…c29e", tone: "success" as StatusTone },
  { time: "10:38:51", event: "tool.invoice.verify", actor: "svc-agent-runtime", object: "批次 INV-240803", tenant: "华东事业群", result: "成功", hash: "b20c…9d10", tone: "success" as StatusTone },
  { time: "10:32:06", event: "policy.approval.requested", actor: "月结智能体", object: "APR-1941", tenant: "集团总部", result: "待审批", hash: "7de2…104b", tone: "warning" as StatusTone },
  { time: "10:21:47", event: "knowledge.document.updated", actor: "赵海", object: "财税制度-2026-17", tenant: "集团总部", result: "成功", hash: "19ab…8f31", tone: "success" as StatusTone },
  { time: "09:58:22", event: "agent.run.blocked", actor: "所得税汇算清缴智能体", object: "RUN-08212", tenant: "研发中心", result: "需复核", hash: "93ca…18d7", tone: "warning" as StatusTone },
  { time: "09:41:03", event: "security.access.denied", actor: "费用审核智能体", object: "合同附件 CT-8931", tenant: "华南事业群", result: "已阻断", hash: "e4f0…31a6", tone: "danger" as StatusTone },
  { time: "09:16:39", event: "agent.definition.published", actor: "林倩", object: "policy-qa@v4.1", tenant: "集团总部", result: "成功", hash: "21cd…ee83", tone: "success" as StatusTone },
];

export const policyRows = [
  { action: "查询法规、制度与公开数据", risk: "低风险", environment: "只读沙箱", approval: "自动放行", retention: "180 天", tone: "success" as StatusTone },
  { action: "读取 ERP 余额、凭证与发票", risk: "中风险", environment: "租户数据域", approval: "策略校验", retention: "365 天", tone: "info" as StatusTone },
  { action: "导出财税明细或批量数据", risk: "高风险", environment: "脱敏工作区", approval: "双人复核", retention: "3 年", tone: "warning" as StatusTone },
  { action: "创建、修改凭证或申报数据", risk: "极高风险", environment: "隔离执行区", approval: "业务+财务审批", retention: "10 年", tone: "danger" as StatusTone },
  { action: "访问个人信息与商业秘密", risk: "敏感", environment: "字段级授权", approval: "数据所有者审批", retention: "按分类分级", tone: "danger" as StatusTone },
];

export const navItems = [
  { id: "overview", label: "运营总览", icon: "▦" },
  { id: "expense-review", label: "报销审核工作台", icon: "¥" },
  { id: "agents", label: "智能体中心", icon: "◇" },
  { id: "runs", label: "任务运行台", icon: "▶" },
  { id: "knowledge", label: "知识与规则", icon: "▤" },
  { id: "tools", label: "工具与连接", icon: "⌘" },
  { id: "policy", label: "安全与策略", icon: "⬡" },
  { id: "audit", label: "审计追踪", icon: "◎" },
  { id: "settings", label: "平台设置", icon: "⚙" },
] as const;

export type NavId = (typeof navItems)[number]["id"];
