"use client";

import { useMemo, useRef, useState } from "react";
import {
  agents,
  approvalItems,
  auditEvents,
  knowledgeSources,
  navItems,
  policyRows,
  recentRuns,
  tools,
  type AgentDefinition,
  type NavId,
  type StatusTone,
} from "@/lib/platform-data";
import type { RuntimeEvent } from "@/lib/agent-runtime";
import {
  AuditIcon,
  BellIcon,
  BookIcon,
  BotIcon,
  ChevronDownIcon,
  DashboardIcon,
  ExpandIcon,
  HelpIcon,
  MenuIcon,
  PlayIcon,
  PlugIcon,
  ReceiptIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
} from "./icons";

const navIcons: Record<NavId, React.ReactNode> = {
  overview: <DashboardIcon />,
  "expense-review": <ReceiptIcon />,
  agents: <BotIcon />,
  runs: <PlayIcon />,
  knowledge: <BookIcon />,
  tools: <PlugIcon />,
  policy: <ShieldIcon />,
  audit: <AuditIcon />,
  settings: <SettingsIcon />,
};

type PlatformUser = { name: string; email: string };

const viewMeta: Record<NavId, { title: string; description: string }> = {
  overview: { title: "运营总览", description: "集团财税智能运营与风险态势" },
  "expense-review": { title: "财务报销审核", description: "统一待办、AI 预审与人工复核工作台" },
  agents: { title: "智能体中心", description: "设计、发布和评估财税智能体" },
  runs: { title: "任务运行台", description: "可解释、可审批、可追溯的 Agent 执行过程" },
  knowledge: { title: "知识与规则", description: "统一管理法规、制度、案例与计算规则" },
  tools: { title: "工具与连接", description: "管理 Agent 可调用的业务系统和财税工具" },
  policy: { title: "安全与策略", description: "用策略、审批和沙箱约束每一次行动" },
  audit: { title: "审计追踪", description: "检索完整操作证据链与模型运行轨迹" },
  settings: { title: "平台设置", description: "租户、模型网关、运行环境与通知配置" },
};

type ExpenseTask = {
  id: string;
  applicant: string;
  department: string;
  title: string;
  amount: string;
  submittedAt: string;
  deadline: string;
  risk: "高风险" | "中风险" | "低风险";
  tone: StatusTone;
  category: string;
  avatar: string;
};

const expenseTasks: ExpenseTask[] = [
  { id: "BX-202608-01862", applicant: "李明", department: "华东销售中心", title: "上海客户拜访差旅报销", amount: "¥12,860.50", submittedAt: "今天 09:42", deadline: "2 小时内", risk: "高风险", tone: "danger", category: "差旅费", avatar: "李" },
  { id: "BX-202608-01859", applicant: "周文静", department: "产品研发中心", title: "研发测试材料采购报销", amount: "¥8,420.00", submittedAt: "今天 09:18", deadline: "今天", risk: "中风险", tone: "warning", category: "研发材料", avatar: "周" },
  { id: "BX-202608-01844", applicant: "王海", department: "集团采购部", title: "供应商会议与交通费用", amount: "¥3,286.00", submittedAt: "昨天 17:36", deadline: "今天", risk: "低风险", tone: "success", category: "会议费", avatar: "王" },
  { id: "BX-202608-01831", applicant: "张晓蕾", department: "华南事业群", title: "深圳项目驻场住宿报销", amount: "¥16,600.00", submittedAt: "昨天 15:08", deadline: "已逾期 1h", risk: "中风险", tone: "warning", category: "差旅费", avatar: "张" },
  { id: "BX-202608-01820", applicant: "赵诚", department: "财务共享中心", title: "税务培训课程费用报销", amount: "¥4,980.00", submittedAt: "8 月 10 日", deadline: "明天", risk: "低风险", tone: "success", category: "培训费", avatar: "赵" },
];

const expenseFindings = [
  { id: "f1", tone: "danger" as StatusTone, label: "住宿标准超限", title: "2 晚住宿单价超过上海市差旅标准", detail: "制度上限 ¥600/晚，实际 ¥880/晚，超标金额 ¥560。申请人附有展会期间酒店涨价说明。", source: "《集团差旅费管理办法》4.2.1" },
  { id: "f2", tone: "warning" as StatusTone, label: "发票信息异常", title: "1 张餐饮发票购买方名称不完整", detail: "发票抬头为“华夏实业”，缺少“集团有限公司”，需确认是否允许入账及抵扣。", source: "《发票合规管理规范》3.1.4" },
  { id: "f3", tone: "warning" as StatusTone, label: "审批前置缺失", title: "客户招待费用未关联事前申请", detail: "报销单包含客户晚餐 ¥1,268，未检索到对应业务招待事前审批单。", source: "《业务招待费管理办法》2.3" },
  { id: "f4", tone: "info" as StatusTone, label: "行程合理性", title: "返程日期晚于会议结束日期 1 天", detail: "会议于 7 月 19 日结束，返程票为 7 月 20 日；申请说明为拜访另一客户。", source: "差旅行程与客户拜访记录交叉核验" },
];

function StatusPill({ tone = "neutral", children }: { tone?: StatusTone; children: React.ReactNode }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function Button({
  children,
  variant = "secondary",
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button type={type} className={`button ${variant} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PlatformApp({ user }: { user: PlatformUser }) {
  const [activeView, setActiveView] = useState<NavId>("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const meta = viewMeta[activeView];

  const navigate = (view: NavId) => {
    setActiveView(view);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="platform-shell">
      <aside className={`sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">财</div>
          <div className="brand-copy">
            <strong>财务智能体</strong>
            <span>Fiance Agent</span>
          </div>
        </div>

        <div className="tenant-switcher" title="当前租户">
          <span className="tenant-logo">华</span>
          <span className="tenant-copy">
            <b>华夏实业集团</b>
            <small>集团总部 · 生产环境</small>
          </span>
          <span className="chevron"><ChevronDownIcon /></span>
        </div>

        <nav className="main-nav" aria-label="平台主导航">
          <span className="nav-caption">智能运营</span>
          {navItems.slice(0, 4).map((item) => (
            <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{navIcons[item.id]}</span>
              <span>{item.label}</span>
              {item.id === "runs" && <em>3</em>}
            </button>
          ))}
          <span className="nav-caption">能力与治理</span>
          {navItems.slice(4, 8).map((item) => (
            <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{navIcons[item.id]}</span>
              <span>{item.label}</span>
              {item.id === "policy" && <em className="warning">3</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className={activeView === "settings" ? "active" : ""} onClick={() => navigate("settings")}>
            <span className="nav-icon"><SettingsIcon /></span>
            <span>平台设置</span>
          </button>
          <div className="runtime-health">
            <div className="health-head"><span className="health-dot" />服务运行正常</div>
            <div className="health-line"><span style={{ width: "99.98%" }} /></div>
            <small>生产集群 · 99.98% 可用</small>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu" aria-label="打开导航" onClick={() => setMobileNavOpen((value) => !value)}><MenuIcon /></button>
          <div className="page-heading">
            <h1>{meta.title}</h1>
            <span>{meta.description}</span>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <SearchIcon size={16} />
              <input aria-label="全局搜索" placeholder="搜索任务、智能体、法规…" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="帮助"><HelpIcon size={17} /></button>
            <button className="icon-button notification-button" aria-label="通知"><BellIcon size={17} /><i /></button>
            <div className="user-menu">
              <span className="user-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="user-copy"><b>{user.name}</b><small>集团财税管理员</small></span>
              <ChevronDownIcon />
            </div>
          </div>
        </header>

        <main key={activeView} className={`page-content view-${activeView}`}>
          {activeView === "overview" && <OverviewView navigate={navigate} notify={notify} />}
          {activeView === "expense-review" && <ExpenseReviewView notify={notify} />}
          {activeView === "agents" && <AgentsView onCreate={() => setCreateOpen(true)} onRun={(id) => { navigate("runs"); notify(`已选择 ${agents.find((agent) => agent.id === id)?.name}`); }} />}
          {activeView === "runs" && <RunsView />}
          {activeView === "knowledge" && <KnowledgeView notify={notify} />}
          {activeView === "tools" && <ToolsView notify={notify} />}
          {activeView === "policy" && <PolicyView notify={notify} />}
          {activeView === "audit" && <AuditView notify={notify} />}
          {activeView === "settings" && <SettingsView notify={notify} user={user} />}
        </main>
      </div>

      {createOpen && <CreateAgentModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); notify("智能体草稿已创建，可继续配置能力"); }} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
      {mobileNavOpen && <button className="nav-backdrop" aria-label="关闭导航" onClick={() => setMobileNavOpen(false)} />}
    </div>
  );
}

function OverviewView({ navigate, notify }: { navigate: (view: NavId) => void; notify: (message: string) => void }) {
  const [approvals, setApprovals] = useState(approvalItems);
  const approve = (id: string) => {
    setApprovals((items) => items.filter((item) => item.id !== id));
    notify("审批已通过，Agent 将继续执行");
  };

  return (
    <>
      <div className="welcome-row">
        <div>
          <p className="eyebrow">2026 年 8 月 3 日 · 星期一</p>
          <h2>上午好，陈经理</h2>
          <p>集团财税运行整体平稳，当前有 <b className="danger-text">5 项高优先级风险</b> 和 <b className="warning-text">3 项待审批任务</b> 需要关注。</p>
        </div>
        <div className="welcome-actions">
          <Button onClick={() => navigate("agents")}>查看智能体</Button>
          <Button variant="primary" onClick={() => navigate("runs")}><span>＋</span> 发起智能任务</Button>
        </div>
      </div>

      <section className="metrics-grid">
        <MetricCard label="本月 Agent 执行" value="14,862" delta="↑ 18.4%" detail="较上月" tone="blue" icon="▶" />
        <MetricCard label="自动化完成率" value="92.6%" delta="↑ 3.2%" detail="目标 90%" tone="green" icon="✓" />
        <MetricCard label="识别风险金额" value="¥ 2,684万" delta="37 项待闭环" detail="本月累计" tone="orange" icon="!" />
        <MetricCard label="节省专业工时" value="4,218h" delta="≈ 26.4 人月" detail="按基准测算" tone="purple" icon="◷" />
      </section>

      <div className="overview-primary-grid">
        <section className="card risk-overview-card">
          <SectionHeader title="集团税务健康度" subtitle="基于 32 个主体、7 大税种实时评估" action={<button className="text-button">查看风险中心 →</button>} />
          <div className="risk-card-body">
            <div className="health-score-wrap">
              <div className="health-score-ring"><div><strong>86</strong><span>健康</span></div></div>
              <p>较上月 <b>+4</b></p>
            </div>
            <div className="risk-dimensions">
              {[
                ["申报合规", 94, "green"], ["发票健康", 88, "blue"], ["税负合理", 76, "orange"], ["资料完备", 91, "purple"], ["政策适用", 82, "cyan"],
              ].map(([label, value, color]) => (
                <div className="dimension-row" key={String(label)}>
                  <span>{label}</span><div><i className={String(color)} style={{ width: `${value}%` }} /></div><b>{value}</b>
                </div>
              ))}
            </div>
            <div className="risk-summary">
              <div><span className="risk-dot high" /><p><b>5</b>高风险</p><small>需立即处置</small></div>
              <div><span className="risk-dot medium" /><p><b>18</b>中风险</p><small>本周处理</small></div>
              <div><span className="risk-dot low" /><p><b>42</b>低风险</p><small>持续观察</small></div>
            </div>
          </div>
        </section>

        <section className="card filing-card">
          <SectionHeader title="申报日历" subtitle="8 月申报进度" action={<button className="text-button">全部主体 →</button>} />
          <div className="filing-total"><div className="filing-ring"><span>72%</span></div><div><strong>23 / 32</strong><span>主体已完成申报</span></div><StatusPill tone="warning">剩余 12 天</StatusPill></div>
          <div className="filing-list">
            <FilingItem date="08" month="AUG" title="增值税及附加" detail="32 个申报主体" done={25} total={32} tone="warning" />
            <FilingItem date="15" month="AUG" title="企业所得税预缴" detail="18 个申报主体" done={18} total={18} tone="success" />
            <FilingItem date="20" month="AUG" title="印花税" detail="26 个申报主体" done={16} total={26} tone="info" />
          </div>
        </section>
      </div>

      <div className="overview-secondary-grid">
        <section className="card run-list-card">
          <SectionHeader title="最近运行" subtitle="全集团 Agent 任务" action={<button className="text-button" onClick={() => navigate("runs")}>查看全部 →</button>} />
          <div className="data-table run-table">
            <div className="table-head"><span>任务</span><span>发起人</span><span>开始时间</span><span>状态</span></div>
            {recentRuns.slice(0, 4).map((run) => (
              <button className="table-row" key={run.id} onClick={() => navigate("runs")}>
                <span className="task-cell"><i className={`agent-mini ${run.tone}`}>{run.agent.slice(0, 1)}</i><span><b>{run.task}</b><small>{run.agent} · {run.id}</small></span></span>
                <span>{run.owner}</span><span>{run.time}</span><span><StatusPill tone={run.tone}>{run.status}</StatusPill></span>
              </button>
            ))}
          </div>
        </section>

        <section className="card approvals-card">
          <SectionHeader title="待我审批" subtitle={`${approvals.length} 项 Agent 高风险操作`} action={<button className="text-button" onClick={() => navigate("policy")}>审批中心 →</button>} />
          <div className="approval-list">
            {approvals.length === 0 && <div className="empty-state"><span>✓</span><b>审批已全部处理</b><p>新的高风险操作会出现在这里</p></div>}
            {approvals.map((item) => (
              <article key={item.id} className="approval-item">
                <div className={`approval-symbol ${item.tone}`}>!</div>
                <div className="approval-copy"><b>{item.title}</b><p>{item.agent} · {item.requester} 发起</p><div><StatusPill tone={item.tone}>{item.risk}</StatusPill><small>截止 {item.deadline}</small></div></div>
                <button className="approve-button" onClick={() => approve(item.id)}>审批</button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="card capability-map-card">
        <SectionHeader title="Agent 运行架构" subtitle="源自 Codex 的 Thread / Turn / Item 事件模型，面向财税场景增加治理层" action={<StatusPill tone="success">生产运行中</StatusPill>} />
        <div className="capability-map">
          <CapabilityNode icon="人" title="用户与业务系统" text="任务、文件、业务事件" tone="neutral" />
          <span className="flow-arrow">→</span>
          <CapabilityNode icon="线" title="Agent 控制面" text="会话 · 编排 · 记忆 · 评估" tone="blue" />
          <span className="flow-arrow">→</span>
          <CapabilityNode icon="策" title="财税治理网关" text="权限 · 审批 · 规则 · 脱敏" tone="purple" />
          <span className="flow-arrow">→</span>
          <CapabilityNode icon="执" title="隔离执行环境" text="工具 · MCP · 沙箱 · 重试" tone="green" />
          <span className="flow-arrow">→</span>
          <CapabilityNode icon="证" title="审计证据链" text="事件 · 引用 · 决策 · 哈希" tone="orange" />
        </div>
      </section>
    </>
  );
}

function MetricCard({ label, value, delta, detail, tone, icon }: { label: string; value: string; delta: string; detail: string; tone: string; icon: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><div className="metric-foot"><b>{delta}</b><span>{detail}</span></div></article>;
}

function FilingItem({ date, month, title, detail, done, total, tone }: { date: string; month: string; title: string; detail: string; done: number; total: number; tone: StatusTone }) {
  const complete = done === total;
  return <div className="filing-item"><div className={`date-box ${complete ? "done" : ""}`}><b>{date}</b><span>{month}</span></div><div className="filing-copy"><b>{title}</b><span>{detail}</span><div><i style={{ width: `${(done / total) * 100}%` }} /></div></div><StatusPill tone={tone}>{done}/{total}</StatusPill></div>;
}

function CapabilityNode({ icon, title, text, tone }: { icon: string; title: string; text: string; tone: string }) {
  return <div className={`capability-node ${tone}`}><i>{icon}</i><b>{title}</b><span>{text}</span></div>;
}

function ExpenseReviewView({ notify }: { notify: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(expenseTasks[0].id);
  const [documentTab, setDocumentTab] = useState("报销信息");
  const [assistantTab, setAssistantTab] = useState("AI 总结");
  const [queueFilter, setQueueFilter] = useState("全部");
  const [reviewComment, setReviewComment] = useState("请补充客户招待事前审批单，并确认住宿超标费用的业务负责人特批意见；餐饮发票抬头需更正后重新提交。");
  const [decision, setDecision] = useState("待人工复核");
  const [findingStatus, setFindingStatus] = useState<Record<string, "pending" | "confirmed" | "dismissed">>(() => Object.fromEntries(expenseFindings.map((finding) => [finding.id, "pending"])));
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "agent", text: "我已完成单据、发票、制度、预算和历史记录的交叉检查。你可以继续追问任意风险点。" },
  ]);
  const task = expenseTasks.find((item) => item.id === selectedId) ?? expenseTasks[0];

  const visibleTasks = queueFilter === "全部"
    ? expenseTasks
    : expenseTasks.filter((item) => queueFilter === "高风险" ? item.risk === "高风险" : item.category === queueFilter);

  const changeTask = (id: string) => {
    setSelectedId(id);
    setDecision("待人工复核");
    setDocumentTab("报销信息");
    setAssistantTab("AI 总结");
  };

  const submitDecision = (nextDecision: string) => {
    setDecision(nextDecision);
    notify(`${nextDecision}：处理结果已安全回写 OA，原流程将继续流转`);
  };

  const sendChat = () => {
    const value = chatInput.trim();
    if (!value) return;
    setChatMessages((messages) => [
      ...messages,
      { role: "user", text: value },
      { role: "agent", text: value.includes("住宿")
        ? "住宿标准为上海地区 ¥600/晚。当前两晚均为 ¥880/晚，超标 ¥560；附件中的展会涨价说明不足以替代业务负责人特批。建议退回补充审批。"
        : "结合现有凭证与制度，当前建议仍为“退回补充材料”。我已把相关证据定位到右侧依据清单，可逐条人工确认。" },
    ]);
    setChatInput("");
  };

  const confirmedCount = Object.values(findingStatus).filter((status) => status === "confirmed").length;

  return (
    <div className="expense-review-page">
      <section className="expense-process card">
        <div className="expense-process-title">
          <div><StatusPill tone="info">来源：泛微 OA</StatusPill><b>报销审批流程</b><code>{task.id}</code></div>
          <div><span className="sync-dot" />状态已同步 · 10:46:28 <button>在 OA 中查看 ↗</button></div>
        </div>
        <div className="process-steps">
          <ProcessStep number="1" title="申请人提交" detail="李明 · 8月11日 09:42" state="done" />
          <ProcessStep number="2" title="部门负责人" detail="王海 · 已通过" state="done" />
          <ProcessStep number="3" title="预算校验" detail="系统自动通过" state="done" />
          <ProcessStep number="4" title="财务审核" detail="当前节点 · 等待复核" state="active" />
          <ProcessStep number="5" title="出纳支付" detail="尚未到达" state="pending" />
        </div>
      </section>

      <div className="expense-workbench">
        <aside className="expense-queue card">
          <div className="expense-queue-head"><div><b>我的报销待办</b><span>12</span></div><button aria-label="刷新待办"><RefreshIcon /></button></div>
          <label className="expense-search"><SearchIcon size={14} /><input placeholder="搜索申请人、单号或摘要" /></label>
          <div className="expense-filter-tabs">
            {["全部", "高风险", "差旅费"].map((item) => <button key={item} className={queueFilter === item ? "active" : ""} onClick={() => setQueueFilter(item)}>{item}</button>)}
          </div>
          <div className="expense-task-list">
            {visibleTasks.map((item) => (
              <button key={item.id} className={selectedId === item.id ? "active" : ""} onClick={() => changeTask(item.id)}>
                <div className="expense-task-top"><span className="expense-applicant-avatar">{item.avatar}</span><span><b>{item.applicant}</b><small>{item.department}</small></span><StatusPill tone={item.tone}>{item.risk}</StatusPill></div>
                <h3>{item.title}</h3>
                <div className="expense-task-bottom"><strong>{item.amount}</strong><span>{item.submittedAt}</span></div>
                <div className={`expense-deadline ${item.deadline.includes("逾期") ? "overdue" : ""}`}><i />处理时限：{item.deadline}</div>
              </button>
            ))}
          </div>
          <div className="queue-summary"><span>今日已处理 <b>18</b></span><span>平均耗时 <b>3.6 分钟</b></span></div>
        </aside>

        <section className="expense-document card">
          <div className="expense-document-head">
            <div className="expense-doc-title"><span className="expense-applicant-avatar large">{task.avatar}</span><div><div><h2>{task.title}</h2><StatusPill tone={task.tone}>{task.risk}</StatusPill></div><p>{task.applicant} · {task.department} · {task.id}</p></div></div>
            <div className="expense-amount"><span>申请金额</span><strong>{task.amount}</strong><small>预算可用 ¥48,230.00</small></div>
          </div>

          <div className="expense-document-tabs">
            {["报销信息", "发票与附件", "流程记录"].map((item) => <button key={item} className={documentTab === item ? "active" : ""} onClick={() => setDocumentTab(item)}>{item}{item === "发票与附件" && <span>6</span>}</button>)}
            <label><input type="checkbox" defaultChecked />只看异常字段</label>
          </div>

          <div className="expense-document-body">
            {documentTab === "报销信息" && (
              <>
                <div className="expense-status-banner"><span>AI</span><div><b>智能预审已完成</b><p>已核验 24 个字段、5 张发票、2 份附件和 8 条企业制度，发现 4 项需要人工复核。</p></div><button onClick={() => setAssistantTab("AI 总结")}>查看风险摘要 →</button></div>
                <section className="expense-section">
                  <SectionHeader title="基本信息" subtitle="数据来自 OA 报销单，关键字段已与人事、预算系统核对" />
                  <div className="expense-field-grid">
                    <ExpenseField label="报销申请人" value="李明（E10286）" verified />
                    <ExpenseField label="所属部门" value="华东销售中心" verified />
                    <ExpenseField label="费用类型" value="客户拜访差旅费" verified />
                    <ExpenseField label="成本中心" value="CC-HDS-2026" verified />
                    <ExpenseField label="出差期间" value="2026-07-17 至 2026-07-20" warning="行程晚于会议 1 天" />
                    <ExpenseField label="目的城市" value="上海" verified />
                    <ExpenseField label="关联项目" value="华东渠道升级项目" verified />
                    <ExpenseField label="支付方式" value="个人垫付" verified />
                  </div>
                </section>

                <section className="expense-section expense-detail-section">
                  <SectionHeader title="费用明细" subtitle="5 项费用 · 价税合计 ¥12,860.50" action={<button className="text-button">查看预算占用 →</button>} />
                  <div className="expense-line-table">
                    <div className="expense-line-head"><span>费用项目</span><span>发生日期</span><span>说明</span><span>金额</span><span>发票</span><span>核验</span></div>
                    <ExpenseLine icon="机" title="往返机票" date="07-17 / 07-20" description="北京 ⇄ 上海经济舱" amount="¥4,386.50" invoice="2 张" status="通过" tone="success" />
                    <ExpenseLine icon="住" title="住宿费" date="07-17 / 07-19" description="上海国际会展酒店 · 2 晚" amount="¥1,760.00" invoice="1 张" status="超标 ¥560" tone="danger" />
                    <ExpenseLine icon="餐" title="客户餐叙" date="07-18" description="上海本帮菜 · 6 人" amount="¥1,268.00" invoice="1 张" status="缺前置审批" tone="warning" />
                    <ExpenseLine icon="车" title="市内交通" date="07-17 / 07-20" description="机场、酒店及客户公司往返" amount="¥846.00" invoice="8 张" status="通过" tone="success" />
                    <ExpenseLine icon="会" title="会议服务费" date="07-18" description="客户方案研讨会场地" amount="¥4,600.00" invoice="1 张" status="通过" tone="success" />
                  </div>
                </section>

                <section className="expense-section human-review-section">
                  <div className="human-review-head"><div><span>人</span><div><h3>人工复核与节点处理</h3><p>AI 只提供建议，最终审批决定由你作出，并回写原 OA 流程。</p></div></div><StatusPill tone={decision === "待人工复核" ? "warning" : "success"}>{decision}</StatusPill></div>
                  <div className="review-progress"><div><span>风险项复核</span><b>{confirmedCount} / {expenseFindings.length} 已确认</b></div><div><i style={{ width: `${confirmedCount / expenseFindings.length * 100}%` }} /></div></div>
                  <label className="review-comment"><span>审批意见</span><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} /><small>AI 已根据风险项生成草稿，请复核后提交。</small></label>
                  <div className="review-actions"><Button onClick={() => submitDecision("已转交业务负责人")}>转交</Button><Button onClick={() => submitDecision("已拒绝")}>拒绝</Button><Button variant="danger" onClick={() => submitDecision("已退回补充材料")}>退回补充材料</Button><Button variant="primary" onClick={() => submitDecision("已审批通过")}>确认通过并回写 OA</Button></div>
                </section>
              </>
            )}

            {documentTab === "发票与附件" && (
              <div className="expense-attachments-view">
                <section className="expense-section">
                  <SectionHeader title="发票核验" subtitle="共 5 张发票，已完成真伪、抬头、税号、重复与业务关联检查" action={<StatusPill tone="warning">1 张需更正</StatusPill>} />
                  <div className="invoice-grid">
                    <InvoiceCard number="243120000001826731" seller="上海国际会展酒店" amount="¥1,760.00" date="2026-07-19" status="通过" tone="success" />
                    <InvoiceCard number="243120000001829214" seller="上海悦江餐饮有限公司" amount="¥1,268.00" date="2026-07-18" status="抬头不完整" tone="danger" />
                    <InvoiceCard number="011002600111428901" seller="中国国际航空股份有限公司" amount="¥2,180.00" date="2026-07-17" status="通过" tone="success" />
                    <InvoiceCard number="011002600111439822" seller="中国国际航空股份有限公司" amount="¥2,206.50" date="2026-07-20" status="通过" tone="success" />
                  </div>
                </section>
                <section className="expense-section">
                  <SectionHeader title="业务附件" subtitle="文件保存在企业电子档案中心" />
                  <div className="attachment-list">
                    <AttachmentCard icon="PDF" name="上海客户拜访行程与会议通知.pdf" meta="2.4 MB · 李明上传" status="已解析" />
                    <AttachmentCard icon="DOC" name="展会期间住宿涨价情况说明.docx" meta="186 KB · 李明上传" status="需特批" warning />
                    <AttachmentCard icon="OA" name="华东渠道升级项目立项审批单" meta="OA-PRJ-2026-00418" status="已关联" />
                  </div>
                </section>
              </div>
            )}

            {documentTab === "流程记录" && (
              <div className="expense-flow-view">
                <SectionHeader title="流程与操作记录" subtitle="原 OA 节点状态和 Agent 处理事件统一展示" />
                <div className="expense-timeline">
                  <ExpenseTimelineItem time="今天 10:46" actor="费用合规稽核 Agent" title="完成智能预审" detail="核验 24 个字段和 5 张发票，识别 4 项人工复核事项。" tone="info" />
                  <ExpenseTimelineItem time="今天 10:43" actor="财务智能体" title="同步 OA 财务审核节点" detail="任务被分配给陈经理，处理时限为 2 小时。" tone="info" />
                  <ExpenseTimelineItem time="今天 10:18" actor="预算控制系统" title="预算校验自动通过" detail="成本中心可用预算 ¥48,230，当前申请占用 ¥12,860.50。" tone="success" />
                  <ExpenseTimelineItem time="今天 10:12" actor="王海 · 部门负责人" title="审批通过" detail="审批意见：客户拜访属实，同意按制度报销。" tone="success" />
                  <ExpenseTimelineItem time="今天 09:42" actor="李明 · 申请人" title="提交报销申请" detail="通过泛微 OA 提交报销单和相关附件。" tone="neutral" />
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="expense-ai-panel card">
          <div className="expense-ai-head"><div><span>AI</span><div><b>费用审核 Agent</b><small>已基于最新制度完成预审</small></div></div><button aria-label="展开 AI 面板"><ExpandIcon /></button></div>
          <div className="expense-ai-tabs">
            {["AI 总结", "对话", "证据"].map((item) => <button key={item} className={assistantTab === item ? "active" : ""} onClick={() => setAssistantTab(item)}>{item}{item === "AI 总结" && <span>4</span>}</button>)}
          </div>

          {assistantTab === "AI 总结" && (
            <div className="ai-summary-panel">
              <div className="ai-recommendation"><div className="ai-rec-head"><span>!</span><div><small>AI 审核建议</small><strong>退回补充材料</strong></div><b>置信度 94%</b></div><p>存在住宿超标、发票抬头不完整和招待费前置审批缺失。建议补齐材料后再进入财务审批。</p></div>
              <div className="ai-summary-stats"><div><b>¥560</b><span>确认超标金额</span></div><div><b>¥1,268</b><span>待补审批金额</span></div><div><b>5 / 6</b><span>票据核验通过</span></div></div>
              <div className="ai-findings-head"><b>需要人工复核</b><span>{confirmedCount}/{expenseFindings.length} 已处理</span></div>
              <div className="ai-findings">
                {expenseFindings.map((finding) => (
                  <article key={finding.id} className={`ai-finding ${findingStatus[finding.id]}`}>
                    <div className="ai-finding-title"><StatusPill tone={finding.tone}>{finding.label}</StatusPill><span>{findingStatus[finding.id] === "confirmed" ? "已确认" : findingStatus[finding.id] === "dismissed" ? "已忽略" : "待复核"}</span></div>
                    <h3>{finding.title}</h3><p>{finding.detail}</p><button className="finding-source" onClick={() => setAssistantTab("证据")}>▤ {finding.source} →</button>
                    <div className="finding-actions"><button onClick={() => setFindingStatus((state) => ({ ...state, [finding.id]: "dismissed" }))}>标记例外</button><button onClick={() => setFindingStatus((state) => ({ ...state, [finding.id]: "confirmed" }))}>✓ 确认风险</button></div>
                  </article>
                ))}
              </div>
              <div className="ai-disclaimer">AI 结论用于辅助审核，不替代财务人员的专业判断。提交前请核对原始凭证和制度依据。</div>
            </div>
          )}

          {assistantTab === "对话" && (
            <div className="expense-chat-panel">
              <div className="expense-chat-context"><span>当前上下文</span><b>{task.id}</b><small>报销单、发票、预算、制度和审批历史已加载</small></div>
              <div className="expense-chat-messages">
                {chatMessages.map((message, index) => <div key={index} className={`expense-chat-message ${message.role}`}><span>{message.role === "agent" ? "AI" : "陈"}</span><p>{message.text}</p></div>)}
              </div>
              <div className="expense-chat-suggestions"><button onClick={() => setChatInput("住宿费为什么被判定为超标？")}>住宿费为何超标？</button><button onClick={() => setChatInput("如果标记为制度例外，还需要谁审批？")}>制度例外由谁审批？</button><button onClick={() => setChatInput("帮我生成更简洁的退回意见")}>生成退回意见</button></div>
              <div className="expense-chat-input"><textarea aria-label="向费用审核 Agent 提问" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="追问风险、制度或处理建议…" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChat(); } }} /><div><button>＋</button><span>回答附带企业制度依据</span><Button variant="primary" onClick={sendChat}>发送</Button></div></div>
            </div>
          )}

          {assistantTab === "证据" && (
            <div className="expense-evidence-panel">
              <div className="evidence-overview"><span>证据完整度</span><b>92%</b><div><i style={{ width: "92%" }} /></div><p>本次判断使用 8 条制度、5 张发票、2 份业务附件和 3 个系统数据源。</p></div>
              <div className="evidence-section"><b>制度与规则</b><EvidenceItem icon="规" title="集团差旅费管理办法" detail="v5.2 · 2026-01-01 生效" match="引用 4.2.1" /><EvidenceItem icon="票" title="发票合规管理规范" detail="v3.8 · 全国适用" match="引用 3.1.4" /><EvidenceItem icon="招" title="业务招待费管理办法" detail="v2.4 · 集团制度" match="引用 2.3" /></div>
              <div className="evidence-section"><b>系统核验记录</b><EvidenceItem icon="OA" title="泛微 OA" detail="流程、申请单与审批历史" match="已同步" success /><EvidenceItem icon="预" title="预算控制系统" detail="成本中心与预算占用" match="已核验" success /><EvidenceItem icon="税" title="金税发票查验" detail="真伪、状态与购买方信息" match="5 张" success /></div>
              <div className="evidence-trace"><div><span>Trace ID</span><code>trace_exp_01862_a91c</code></div><button>查看完整审计轨迹 →</button></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, detail, state }: { number: string; title: string; detail: string; state: "done" | "active" | "pending" }) {
  return <div className={`process-step ${state}`}><div><span>{state === "done" ? "✓" : number}</span></div><b>{title}</b><small>{detail}</small></div>;
}

function ExpenseField({ label, value, verified, warning }: { label: string; value: string; verified?: boolean; warning?: string }) {
  return <div className={`expense-field ${warning ? "warning" : ""}`}><span>{label}</span><div><b>{value}</b>{verified && <i>✓ 已核验</i>}</div>{warning && <small>! {warning}</small>}</div>;
}

function ExpenseLine({ icon, title, date, description, amount, invoice, status, tone }: { icon: string; title: string; date: string; description: string; amount: string; invoice: string; status: string; tone: StatusTone }) {
  return <div className={`expense-line-row ${tone === "danger" || tone === "warning" ? "flagged" : ""}`}><span className="expense-type-icon">{icon}</span><span>{title}</span><span>{date}</span><span>{description}</span><strong>{amount}</strong><span>{invoice}</span><StatusPill tone={tone}>{status}</StatusPill></div>;
}

function InvoiceCard({ number, seller, amount, date, status, tone }: { number: string; seller: string; amount: string; date: string; status: string; tone: StatusTone }) {
  return <article className={`invoice-card ${tone === "danger" ? "flagged" : ""}`}><div className="invoice-card-head"><span>增值税电子普通发票</span><StatusPill tone={tone}>{status}</StatusPill></div><b>{seller}</b><div><span>发票号码</span><code>{number}</code></div><div><span>开票日期</span><b>{date}</b></div><div><span>价税合计</span><strong>{amount}</strong></div><button>查看原票 ↗</button></article>;
}

function AttachmentCard({ icon, name, meta, status, warning }: { icon: string; name: string; meta: string; status: string; warning?: boolean }) {
  return <article className="attachment-card"><span>{icon}</span><div><b>{name}</b><small>{meta}</small></div><StatusPill tone={warning ? "warning" : "success"}>{status}</StatusPill><button>预览</button></article>;
}

function ExpenseTimelineItem({ time, actor, title, detail, tone }: { time: string; actor: string; title: string; detail: string; tone: StatusTone }) {
  return <div className={`expense-timeline-item ${tone}`}><div><span>✓</span></div><time>{time}</time><article><small>{actor}</small><b>{title}</b><p>{detail}</p></article></div>;
}

function EvidenceItem({ icon, title, detail, match, success }: { icon: string; title: string; detail: string; match: string; success?: boolean }) {
  return <article className="evidence-item"><span>{icon}</span><div><b>{title}</b><small>{detail}</small></div><StatusPill tone={success ? "success" : "info"}>{match}</StatusPill></article>;
}

function AgentsView({ onCreate, onRun }: { onCreate: () => void; onRun: (id: string) => void }) {
  const [filter, setFilter] = useState("全部");
  const filters = ["全部", "运行中", "草稿", "维护中"];
  const filtered = filter === "全部" ? agents : agents.filter((agent) => agent.status === filter);

  return (
    <>
      <div className="page-toolbar agents-toolbar">
        <div className="filter-tabs">
          {filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "全部" ? agents.length : agents.filter((agent) => agent.status === item).length}</span></button>)}
        </div>
        <div className="toolbar-actions"><Button>从模板创建</Button><Button variant="primary" onClick={onCreate}>＋ 新建智能体</Button></div>
      </div>

      <div className="agent-grid">
        {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} onRun={() => onRun(agent.id)} />)}
      </div>

      <section className="card studio-blueprint">
        <SectionHeader title="企业级智能体标准" subtitle="每个发布版本都必须经过能力、风险、质量与证据链检查" action={<button className="text-button">查看发布规范 →</button>} />
        <div className="standard-grid">
          <StandardItem number="01" title="角色与边界" text="明确税种、主体、期间与禁止事项，避免越权建议。" />
          <StandardItem number="02" title="知识与时效" text="法规效力、地区口径、企业制度均可追溯到原文。" />
          <StandardItem number="03" title="工具与权限" text="按最小权限授予工具，写操作必须经过策略和人工审批。" />
          <StandardItem number="04" title="评估与审计" text="上线前跑回归评测，运行中记录完整输入、行动与结果。" />
        </div>
      </section>
    </>
  );
}

function AgentCard({ agent, onRun }: { agent: AgentDefinition; onRun: () => void }) {
  return (
    <article className="agent-card">
      <div className="agent-card-head"><span className="agent-avatar" style={{ background: `${agent.color}18`, color: agent.color }}>{agent.shortName}</span><div><StatusPill tone={agent.tone}>{agent.status}</StatusPill><button className="more-button">•••</button></div></div>
      <div className="agent-title"><h3>{agent.name}</h3><span>{agent.version}</span></div>
      <p>{agent.description}</p>
      <div className="agent-tags"><span>{agent.domain}</span><span>{agent.tools} 个工具</span><span>{agent.knowledge} 个知识源</span></div>
      <div className="agent-metrics"><div><span>近 30 天运行</span><b>{agent.runs}</b></div><div><span>评测准确率</span><b>{agent.accuracy}</b></div><div><span>平均耗时</span><b>{agent.latency}</b></div></div>
      <div className="agent-card-foot"><span><i className={`live-dot ${agent.status === "运行中" ? "online" : ""}`} />最近更新 2 天前</span><Button variant="ghost">配置</Button><Button variant="primary" onClick={onRun}>运行</Button></div>
    </article>
  );
}

function StandardItem({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="standard-item"><span>{number}</span><div><b>{title}</b><p>{text}</p></div></div>;
}

function RunsView() {
  const [selectedAgent, setSelectedAgent] = useState("vat-risk");
  const [prompt, setPrompt] = useState("请检查华东区 7 月增值税申报数据，识别税负异常、发票风险和账税勾稽差异，并给出处理优先级。");
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState("");
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [runInfo, setRunInfo] = useState<{ runId?: string; threadId?: string }>({});
  const abortRef = useRef<AbortController | null>(null);
  const selected = agents.find((agent) => agent.id === selectedAgent) ?? agents[0];

  const execute = async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setAnswer("");
    setEvents([]);
    setRunInfo({});
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "text/event-stream" },
        body: JSON.stringify({ prompt, agentId: selectedAgent, tenantId: "tenant-huaxia", approvalMode: "risk-based" }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error("运行服务暂不可用");
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
          const event = JSON.parse(line.slice(5).trim()) as RuntimeEvent;
          if (event.runId || event.threadId) setRunInfo((current) => ({ runId: event.runId ?? current.runId, threadId: event.threadId ?? current.threadId }));
          if (event.type === "message.delta") setAnswer((current) => current + (event.content ?? ""));
          else setEvents((current) => [...current, event]);
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setEvents((current) => [...current, { type: "run.failed", at: new Date().toISOString(), content: (error as Error).message, status: "failed" }]);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="run-workbench">
      <aside className="run-history-panel card">
        <div className="history-head"><b>任务会话</b><button>＋</button></div>
        <label className="history-search"><SearchIcon size={14} /><input placeholder="搜索会话" /></label>
        <div className="history-section"><span>今天</span>{recentRuns.slice(0, 3).map((run, index) => <button key={run.id} className={index === 1 ? "active" : ""}><i className={run.tone}>{run.agent.slice(0, 1)}</i><span><b>{run.task}</b><small>{run.time} · {run.status}</small></span></button>)}</div>
        <div className="history-section"><span>更早</span>{recentRuns.slice(3).map((run) => <button key={run.id}><i className={run.tone}>{run.agent.slice(0, 1)}</i><span><b>{run.task}</b><small>{run.time} · {run.status}</small></span></button>)}</div>
      </aside>

      <section className="run-console card">
        <div className="console-head">
          <div><span className="agent-avatar" style={{ background: `${selected.color}18`, color: selected.color }}>{selected.shortName}</span><div><select className="agent-select" aria-label="选择智能体" value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)}>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select><small>{selected.version} · 风险审批模式</small></div></div>
          <div><StatusPill tone={running ? "info" : "success"}>{running ? "正在运行" : "运行环境就绪"}</StatusPill><button className="icon-button">•••</button></div>
        </div>

        <div className="conversation">
          <div className="message user-message"><div className="message-avatar">陈</div><div><div className="message-meta"><b>陈经理</b><span>刚刚</span></div><p>{prompt}</p><div className="message-context"><span>集团合并口径</span><span>2026 年 7 月</span><span>华东事业群</span></div></div></div>

          {(running || events.length > 0 || answer) && (
            <div className="message agent-message">
              <div className="message-avatar agent">税</div>
              <div className="agent-answer">
                <div className="message-meta"><b>{selected.name}</b><StatusPill tone={running ? "info" : "success"}>{running ? "执行中" : "已完成"}</StatusPill><span>{runInfo.runId}</span></div>
                <div className="inline-trace">
                  {events.filter((event) => event.type !== "run.started" && event.type !== "run.completed" && event.type !== "run.failed").map((event, index) => (
                    <div key={`${event.itemId ?? event.type}-${index}`} className="trace-chip"><span>✓</span><b>{event.title}</b><small>{event.content}</small></div>
                  ))}
                </div>
                {answer ? <MarkdownLikeText text={answer} /> : <div className="thinking-state"><span /><span /><span />正在分析企业数据与有效法规</div>}
                {!running && answer && <div className="answer-actions"><button>复制结果</button><button>导出底稿</button><button>创建处置任务</button><span>结果需人工复核</span></div>}
                {events.some((event) => event.type === "run.failed") && <div className="error-callout">{events.find((event) => event.type === "run.failed")?.content}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="prompt-area">
          <div className="prompt-presets"><button onClick={() => setPrompt("检查本月进项发票中的重复报销、税率错误和业务实质风险。")}>发票风险扫描</button><button onClick={() => setPrompt("复核企业所得税汇算清缴底稿，识别纳税调整与优惠适用风险。")}>所得税预审</button><button onClick={() => setPrompt("检查 7 月关账前账账、账表和账税勾稽差异。")}>月结检查</button></div>
          <textarea aria-label="任务指令" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入财税任务，描述主体、期间和期望结果…" onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) execute(); }} />
          <div className="prompt-toolbar"><div><button title="添加附件">＋</button><button title="选择知识库">▤</button><button title="选择业务系统">⌘</button><span>数据域：集团财税</span></div>{running ? <Button variant="danger" onClick={stop}>■ 停止</Button> : <Button variant="primary" onClick={execute} disabled={!prompt.trim()}>运行任务 <span>⌘↵</span></Button>}</div>
        </div>
      </section>

      <aside className="execution-panel card">
        <div className="execution-head"><b>执行详情</b><StatusPill tone={running ? "info" : events.length ? "success" : "neutral"}>{running ? "LIVE" : events.length ? "完成" : "待运行"}</StatusPill></div>
        <div className="execution-tabs"><button className="active">轨迹</button><button>上下文</button><button>评估</button></div>
        <div className="runtime-meta"><div><span>Thread</span><code>{runInfo.threadId ?? "等待创建"}</code></div><div><span>权限配置</span><b>risk-based</b></div><div><span>运行沙箱</span><b>workspace-write</b></div></div>
        <div className="execution-timeline">
          {!events.length && <div className="trace-placeholder"><span>▶</span><b>运行后显示完整轨迹</b><p>每次知识检索、工具调用、审批和输出都会在这里形成证据链。</p></div>}
          {events.map((event, index) => <TraceEvent key={`${event.type}-${index}`} event={event} index={index} />)}
        </div>
        {events.length > 0 && <div className="cost-summary"><span>本次资源消耗</span><div><b>14.5K</b><small>Tokens</small></div><div><b>7</b><small>工具调用</small></div><div><b>¥0.42</b><small>估算成本</small></div></div>}
      </aside>
    </div>
  );
}

function MarkdownLikeText({ text }: { text: string }) {
  return <div className="markdown-result">{text.split("\n").map((line, index) => {
    if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
    if (/^\d+\. /.test(line)) return <div className="finding-line" key={index}><span>{line.match(/^\d+/)?.[0]}</span><p>{line.replace(/^\d+\. /, "")}</p></div>;
    if (line.startsWith("**处置建议：**")) return <div className="advice-callout" key={index}><b>处置建议</b><p>{line.replace("**处置建议：**", "").trim()}</p></div>;
    if (!line.trim()) return <div className="text-spacer" key={index} />;
    return <p key={index}>{line}</p>;
  })}</div>;
}

function TraceEvent({ event, index }: { event: RuntimeEvent; index: number }) {
  const failed = event.status === "failed";
  return <div className={`trace-event ${failed ? "failed" : ""}`}><div className="trace-marker">{failed ? "!" : index === 0 ? "▶" : "✓"}</div><div><span>{event.title ?? event.type}</span><p>{event.content}</p><small>{new Date(event.at).toLocaleTimeString("zh-CN", { hour12: false })}</small></div></div>;
}

function KnowledgeView({ notify }: { notify: (message: string) => void }) {
  const [tab, setTab] = useState("知识源");
  return (
    <>
      <div className="page-toolbar"><div className="filter-tabs">{["知识源", "法规效力", "业务规则", "检索评测"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div><div className="toolbar-actions"><Button onClick={() => notify("已发起所有知识源的增量同步")}>同步全部</Button><Button variant="primary" onClick={() => notify("知识源连接向导已准备好")}>＋ 接入知识源</Button></div></div>
      <section className="knowledge-hero">
        <div><span className="eyebrow">ENTERPRISE KNOWLEDGE FABRIC</span><h2>让每个结论都有依据，让每条依据都在有效期内</h2><p>统一解析国家法规、地方口径、企业制度与历史案例，自动识别失效、冲突和地区适用性。</p><div className="hero-actions"><Button variant="primary">测试检索质量</Button><Button>查看引用图谱</Button></div></div>
        <div className="knowledge-stats"><div><strong>32,815</strong><span>有效文档</span></div><div><strong>227.3万</strong><span>可检索知识片段</span></div><div><strong>96.4%</strong><span>引用准确率</span></div><div><strong>2.8h</strong><span>平均更新延迟</span></div></div>
      </section>
      <div className="knowledge-grid">
        <section className="card source-list-card"><SectionHeader title="知识源目录" subtitle="5 个已连接数据源" action={<label className="compact-search"><SearchIcon size={14} /><input placeholder="搜索知识源" /></label>} /><div className="source-list">{knowledgeSources.map((source, index) => <div className="source-row" key={source.name}><span className={`source-icon source-${index}`}>▤</span><div className="source-main"><div><b>{source.name}</b><StatusPill tone={source.tone}>{source.status}</StatusPill></div><p>{source.type} · {source.docs} 份文档 · {source.chunks} 知识片段</p><div className="coverage-line"><i style={{ width: `${source.coverage}%` }} /></div></div><div className="source-sync"><span>覆盖率 <b>{source.coverage}%</b></span><small>更新于 {source.updated}</small></div><button className="more-button">•••</button></div>)}</div></section>
        <aside className="card knowledge-quality"><SectionHeader title="知识质量" subtitle="过去 30 天" /><div className="quality-score"><div className="mini-ring"><b>92</b></div><div><b>优秀</b><span>较上月 +3.6</span></div></div><QualityRow label="有效性" value={97} tone="green" /><QualityRow label="完整性" value={89} tone="blue" /><QualityRow label="一致性" value={91} tone="purple" /><QualityRow label="新鲜度" value={86} tone="orange" /><div className="quality-alert"><span>!</span><div><b>12 条政策口径待确认</b><p>系统检测到地方口径与集团规则可能存在冲突。</p><button>立即处理 →</button></div></div></aside>
      </div>
      <section className="card regulation-matrix"><SectionHeader title="法规效力监控" subtitle="按税种和适用范围持续追踪" action={<button className="text-button">查看全部变更 →</button>} /><div className="regulation-cards"><RegulationItem tax="增值税" count="2,864" change="本周新增 18" health={98} /><RegulationItem tax="企业所得税" count="2,128" change="本周新增 7" health={96} /><RegulationItem tax="个人所得税" count="1,406" change="本周修订 4" health={94} /><RegulationItem tax="其他税费" count="3,927" change="12 条待确认" health={87} warning /></div></section>
    </>
  );
}

function QualityRow({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="quality-row"><span>{label}</span><div><i className={tone} style={{ width: `${value}%` }} /></div><b>{value}</b></div>; }
function RegulationItem({ tax, count, change, health, warning }: { tax: string; count: string; change: string; health: number; warning?: boolean }) { return <div className="regulation-item"><div><span>{tax}</span><StatusPill tone={warning ? "warning" : "success"}>{warning ? "需关注" : "健康"}</StatusPill></div><strong>{count}</strong><p>有效政策与规则</p><div className="regulation-foot"><span>{change}</span><b>{health}%</b></div></div>; }

function ToolsView({ notify }: { notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = tools.filter((tool) => `${tool.name}${tool.category}${tool.description}`.includes(query));
  return (
    <>
      <div className="integration-banner"><div><span className="banner-icon">⌘</span><div><b>工具是 Agent 连接真实业务的行动能力</b><p>所有调用均经过身份、租户、字段与操作级策略校验，并写入不可抵赖的审计日志。</p></div></div><div><span className="health-dot" /> 7 / 8 个连接健康</div></div>
      <div className="page-toolbar"><label className="tool-search"><SearchIcon size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工具、系统或能力" /></label><div className="toolbar-actions"><Button onClick={() => notify("已开始检测全部连接")}>检测连接</Button><Button variant="primary" onClick={() => notify("连接向导已打开")}>＋ 新建连接</Button></div></div>
      <div className="tool-grid">{visible.map((tool) => <article className="tool-card" key={tool.name}><div className="tool-card-head"><span className="tool-icon">{tool.icon}</span><StatusPill tone={tool.tone}>{tool.status}</StatusPill></div><h3>{tool.name}</h3><span className="tool-category">{tool.category}</span><p>{tool.description}</p><div className="tool-metrics"><span>平均响应 <b>{tool.latency}</b></span><span>30 天调用 <b>{tool.calls}</b></span></div><div className="tool-card-foot"><span>OAuth 2.0 · mTLS</span><Button variant="ghost">管理</Button></div></article>)}</div>
      <section className="card connector-architecture"><SectionHeader title="企业连接架构" subtitle="MCP 标准化能力 + 企业级接入网关" /><div className="connector-flow"><div><b>Agent Runtime</b><span>受策略约束的工具请求</span></div><i>→</i><div className="featured"><b>企业工具网关</b><span>鉴权 · 限流 · 脱敏 · 审计</span></div><i>→</i><div><b>业务系统与数据</b><span>ERP · 税务 · 档案 · 外部服务</span></div></div></section>
    </>
  );
}

function PolicyView({ notify }: { notify: (message: string) => void }) {
  const [approvalCount, setApprovalCount] = useState(3);
  return (
    <>
      <div className="security-overview-grid"><article className="security-score-card"><div className="security-score"><strong>94</strong><span>安全成熟度</span></div><div><h2>平台安全基线良好</h2><p>身份、权限、运行时隔离与审计控制均已启用。</p><div className="security-tags"><StatusPill tone="success">等保三级控制映射</StatusPill><StatusPill tone="success">数据不出域</StatusPill><StatusPill tone="success">全链路审计</StatusPill></div></div></article><article className="security-stat"><span>待审批操作</span><strong>{approvalCount}</strong><small>2 项将在 2 小时内到期</small></article><article className="security-stat"><span>今日策略拦截</span><strong>17</strong><small>均已安全处置</small></article><article className="security-stat"><span>高权限工具</span><strong>6</strong><small>100% 启用人工审批</small></article></div>
      <div className="policy-layout">
        <section className="card policy-table-card"><SectionHeader title="行动策略矩阵" subtitle="根据数据敏感度和操作影响自动选择执行环境与审批流程" action={<Button variant="primary" onClick={() => notify("策略编辑器已准备好")}>编辑策略</Button>} /><div className="policy-table"><div className="policy-head"><span>Agent 行动</span><span>风险级别</span><span>执行环境</span><span>审批方式</span><span>审计留存</span></div>{policyRows.map((row) => <div className="policy-row" key={row.action}><span><b>{row.action}</b></span><span><StatusPill tone={row.tone}>{row.risk}</StatusPill></span><span>{row.environment}</span><span>{row.approval}</span><span>{row.retention}</span></div>)}</div></section>
        <aside className="card pending-policy"><SectionHeader title="实时审批队列" subtitle={`${approvalCount} 项待处理`} />{approvalCount > 0 ? approvalItems.slice(0, approvalCount).map((item) => <article key={item.id}><div><StatusPill tone={item.tone}>{item.risk}</StatusPill><small>{item.id}</small></div><b>{item.title}</b><p>{item.agent} · {item.requester}</p><div><Button variant="ghost" onClick={() => { setApprovalCount((value) => Math.max(0, value - 1)); notify("操作已拒绝并通知发起人"); }}>拒绝</Button><Button variant="primary" onClick={() => { setApprovalCount((value) => Math.max(0, value - 1)); notify("操作已批准并继续执行"); }}>批准</Button></div></article>) : <div className="empty-state"><span>✓</span><b>队列已清空</b><p>所有高风险操作均已处理</p></div>}</aside>
      </div>
      <section className="card sandbox-grid-card"><SectionHeader title="运行时隔离与权限边界" subtitle="参考 Codex 审批与沙箱机制，扩展企业租户和数据分级控制" /><div className="sandbox-grid"><SandboxItem icon="只" title="只读分析区" text="法规检索、报表分析与指标计算" badge="自动放行" tone="success" /><SandboxItem icon="脱" title="脱敏工作区" text="明细导出、文档解析与跨源关联" badge="策略审批" tone="info" /><SandboxItem icon="隔" title="隔离执行区" text="凭证写入、申报修改与批量操作" badge="人工审批" tone="warning" /><SandboxItem icon="禁" title="禁止行动" text="越租户访问、绕过审计与未授权外传" badge="始终阻断" tone="danger" /></div></section>
    </>
  );
}

function SandboxItem({ icon, title, text, badge, tone }: { icon: string; title: string; text: string; badge: string; tone: StatusTone }) { return <div className="sandbox-item"><span className={tone}>{icon}</span><div><b>{title}</b><p>{text}</p><StatusPill tone={tone}>{badge}</StatusPill></div></div>; }

function AuditView({ notify }: { notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => auditEvents.filter((event) => Object.values(event).join(" ").toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <>
      <section className="audit-hero"><div><span className="eyebrow">IMMUTABLE AUDIT TRAIL</span><h2>从用户意图到 Agent 行动，每一步都有证据</h2><p>事件流按租户隔离，关键载荷生成哈希摘要，支持监管检查、内部审计和问题回放。</p></div><div className="audit-hero-stats"><div><strong>1.28亿</strong><span>累计审计事件</span></div><div><strong>10 年</strong><span>最长留存周期</span></div><div><strong>&lt; 3s</strong><span>事件入库延迟</span></div></div></section>
      <div className="page-toolbar audit-toolbar"><label className="tool-search"><SearchIcon size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索事件、对象、操作者或追踪 ID" /></label><div className="toolbar-actions"><Button>今天</Button><Button>全部事件</Button><Button onClick={() => notify("审计导出任务已创建，完成后将通知你")}>导出证据包</Button></div></div>
      <section className="card audit-table-card"><div className="audit-table"><div className="audit-head"><span>时间</span><span>事件</span><span>操作者</span><span>业务对象</span><span>租户/数据域</span><span>结果</span><span>载荷哈希</span></div>{filtered.map((event) => <div className="audit-row" key={`${event.time}-${event.event}`}><span>{event.time}</span><span><code>{event.event}</code></span><span>{event.actor}</span><span><b>{event.object}</b></span><span>{event.tenant}</span><span><StatusPill tone={event.tone}>{event.result}</StatusPill></span><span><code>{event.hash}</code></span></div>)}</div></section>
      <div className="audit-bottom-grid"><section className="card trace-search"><SectionHeader title="追踪与回放" subtitle="输入 Trace ID 查看完整会话与工具行动" /><div className="trace-input"><input placeholder="例如 trace_01J4K…" /><Button variant="primary" onClick={() => notify("请输入有效的 Trace ID")}>开始回放</Button></div><p>回放默认隐藏敏感字段，查看原始数据需获得数据所有者授权。</p></section><section className="card compliance-map"><SectionHeader title="合规控制映射" /><div><StatusPill tone="success">操作日志</StatusPill><StatusPill tone="success">访问留痕</StatusPill><StatusPill tone="success">模型追踪</StatusPill><StatusPill tone="success">审批证据</StatusPill><StatusPill tone="success">数据血缘</StatusPill><StatusPill tone="success">不可抵赖</StatusPill></div></section></div>
    </>
  );
}

function SettingsView({ notify, user }: { notify: (message: string) => void; user: PlatformUser }) {
  const [settings, setSettings] = useState({ piiMask: true, citations: true, humanReview: true, telemetry: true });
  const toggle = (key: keyof typeof settings) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return (
    <div className="settings-layout">
      <aside className="settings-nav card"><b>平台配置</b>{["组织与租户", "模型与运行时", "数据安全", "通知与告警", "成员与角色", "API 与开发者"].map((item, index) => <button className={index === 1 ? "active" : ""} key={item}>{item}</button>)}</aside>
      <div className="settings-main">
        <section className="card settings-card"><SectionHeader title="模型与运行时" subtitle="统一管理模型路由、Agent 执行模式和安全默认值" action={<Button variant="primary" onClick={() => notify("配置已保存并将在新任务中生效")}>保存更改</Button>} /><div className="settings-form"><label><span>默认 Agent 模型</span><select defaultValue="enterprise-reasoning"><option value="enterprise-reasoning">企业推理模型（推荐）</option><option>高性能通用模型</option><option>私有化模型集群</option></select><small>由模型网关按质量、成本与数据域选择实际模型。</small></label><label><span>运行时模式</span><select defaultValue="demo"><option value="demo">演示运行时</option><option value="bridge">Codex App Server Bridge</option><option value="responses">企业 Responses 网关</option></select><small>本项目默认使用演示模式；生产环境建议连接企业模型网关。</small></label><label><span>默认审批策略</span><select defaultValue="risk"><option value="risk">基于风险自动决策</option><option value="manual">所有行动人工审批</option><option value="auto">低风险自动化</option></select></label><label><span>默认执行环境</span><select defaultValue="workspace"><option value="workspace">租户隔离工作区</option><option value="readonly">只读沙箱</option><option value="isolated">高风险隔离区</option></select></label></div></section>
        <section className="card gateway-card"><SectionHeader title="模型网关" subtitle="生产流量通过企业网关完成鉴权、路由、限流与日志脱敏" action={<StatusPill tone="success">连接正常</StatusPill>} /><div className="gateway-row"><div className="gateway-icon">AI</div><div><b>CN Enterprise Gateway</b><p>https://ai-gateway.internal.example/v1</p><span>华东主集群 · mTLS · 数据不出境</span></div><div><b>36ms</b><span>网关延迟</span></div><Button>测试连接</Button></div></section>
        <section className="card toggle-settings"><SectionHeader title="运行保护" subtitle="对全部智能体生效的最低安全基线" /><SettingToggle label="敏感字段自动脱敏" text="在模型调用、日志和导出环节识别并遮盖个人信息与商业秘密。" enabled={settings.piiMask} onToggle={() => toggle("piiMask")} /><SettingToggle label="强制输出政策引用" text="财税结论必须关联有效法规或企业制度原文。" enabled={settings.citations} onToggle={() => toggle("citations")} /><SettingToggle label="高风险结论人工复核" text="涉及申报、凭证、税务筹划和重大金额的结果必须由专业人员确认。" enabled={settings.humanReview} onToggle={() => toggle("humanReview")} /><SettingToggle label="匿名运行质量遥测" text="记录延迟、错误率和工具健康度，不采集业务正文。" enabled={settings.telemetry} onToggle={() => toggle("telemetry")} /></section>
        <section className="card org-card"><SectionHeader title="当前身份与租户" /><div className="identity-row"><span className="user-avatar large">{user.name.slice(0, 1)}</span><div><b>{user.name}</b><p>{user.email}</p><span>集团财税管理员 · 全局审计员</span></div><Button>管理权限</Button></div></section>
      </div>
    </div>
  );
}

function SettingToggle({ label, text, enabled, onToggle }: { label: string; text: string; enabled: boolean; onToggle: () => void }) { return <div className="setting-toggle"><div><b>{label}</b><p>{text}</p></div><button className={enabled ? "enabled" : ""} onClick={onToggle} role="switch" aria-checked={enabled}><span /></button></div>; }

function CreateAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState(1);
  return <div className="modal-backdrop"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-agent-title"><div className="modal-head"><div><span className="eyebrow">AGENT BUILDER</span><h2 id="create-agent-title">创建财税智能体</h2><p>从业务目标开始，平台会生成符合企业治理标准的初始配置。</p></div><button onClick={onClose}>×</button></div><div className="stepper"><span className={step >= 1 ? "active" : ""}>1 <b>基本信息</b></span><i /><span className={step >= 2 ? "active" : ""}>2 <b>能力配置</b></span><i /><span>3 <b>评测发布</b></span></div>{step === 1 ? <div className="modal-form"><label><span>智能体名称</span><input defaultValue="税务风险分析专家" /></label><label><span>业务领域</span><select defaultValue="risk"><option value="risk">税务风险管理</option><option>财务核算</option><option>政策咨询</option><option>费用管理</option></select></label><label className="full"><span>目标与职责</span><textarea defaultValue="针对集团各申报主体，识别税负、发票、收入和申报表之间的异常，给出风险等级、判断依据和可执行的处置建议。" /></label><label className="full"><span>禁止事项</span><input defaultValue="不得直接修改申报数据；不得给出无政策依据的筹划建议" /></label></div> : <div className="ability-picker"><AbilityChoice title="法规与制度检索" text="检索有效政策并返回原文引用" selected /><AbilityChoice title="ERP 只读查询" text="查询总账、凭证与辅助核算" selected /><AbilityChoice title="发票核验" text="核验发票状态与抵扣信息" selected /><AbilityChoice title="业务系统写入" text="创建或修改凭证、申报数据" /><AbilityChoice title="文件分析" text="解析表格、合同和申报底稿" selected /><AbilityChoice title="外部网络访问" text="访问未纳管的互联网数据" /></div>}<div className="modal-foot"><Button onClick={step === 1 ? onClose : () => setStep(1)}>{step === 1 ? "取消" : "上一步"}</Button><Button variant="primary" onClick={step === 1 ? () => setStep(2) : onCreated}>{step === 1 ? "下一步：配置能力" : "创建草稿"}</Button></div></div></div>;
}

function AbilityChoice({ title, text, selected }: { title: string; text: string; selected?: boolean }) { const [checked, setChecked] = useState(Boolean(selected)); return <button className={`ability-choice ${checked ? "selected" : ""}`} onClick={() => setChecked((value) => !value)}><span>{checked ? "✓" : ""}</span><div><b>{title}</b><p>{text}</p></div></button>; }
