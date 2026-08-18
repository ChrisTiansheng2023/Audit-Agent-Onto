# 财务智能体 · 企业财税 Agent 平台

一套参考 OpenAI Codex 开源架构实现的企业级财税智能体平台网页版。项目采用
Thread / Turn / Item 事件模型，将智能体运行、财税知识、业务工具、风险审批、
沙箱执行和审计证据链整合在一个产品中。

## 已实现能力

- 集团财税运营总览、风险态势与申报进度
- 财税智能体设计、版本、工具、知识与评测视图
- 支持 SSE 流式事件的任务运行台
- 法规、企业制度、案例与地方口径知识治理
- ERP、发票、档案、计算器等企业工具连接目录
- 风险分级、人工审批与隔离运行环境策略
- 面向监管和内部审计的不可抵赖事件追踪
- D1 多租户业务数据模型和 Cloudflare Sites 部署配置
- 可选的本地 Codex App Server HTTP/SSE 桥接服务

## 运行模式

默认使用 `demo` 模式，无需任何密钥即可体验完整交互。

复制 `.env.example` 为 `.env.local` 后可配置：

- `AGENT_RUNTIME_MODE=demo`：内置财税演示运行时。
- `AGENT_RUNTIME_MODE=bridge`：通过 `CODEX_BRIDGE_URL` 连接本地 Codex。
- `responses`：预留给企业 Responses API 或私有模型网关。

本地 Codex 桥接默认绑定 `127.0.0.1:8788`，并以只读沙箱运行：

```bash
npm run bridge
```

## 本地开发

```bash
npm install
npm run dev
```

生产构建与测试：

```bash
npm run build
npm test
```

## 生产化注意事项

演示数据不能用于实际申报或账务处理。生产环境应接入企业身份系统、模型网关、
真实 D1/数据库、对象存储、密钥管理、审批工作流和财税业务系统。任何写入 ERP、
申报系统或外部数据传输的操作都应采用最小权限、双人复核和完整审计。

Codex App Server 的 WebSocket 传输仍属于实验能力，本项目的本地桥接使用官方
稳定的 stdio JSONL 传输。桥接服务不是互联网边界服务，不应直接暴露到公网。

