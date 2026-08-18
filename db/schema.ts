import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    region: text("region").notNull().default("CN"),
    dataResidency: text("data_residency").notNull().default("CN"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("organizations_name_idx").on(table.name)],
);

export const agents = sqliteTable(
  "agents",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    domain: text("domain").notNull(),
    version: text("version").notNull(),
    status: text("status", { enum: ["draft", "published", "maintenance"] }).notNull(),
    instructions: text("instructions").notNull(),
    approvalMode: text("approval_mode").notNull().default("risk-based"),
    sandboxPolicy: text("sandbox_policy").notNull().default("workspace-write"),
    createdBy: text("created_by").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("agents_org_idx").on(table.organizationId),
    index("agents_status_idx").on(table.status),
  ],
);

export const agentRuns = sqliteTable(
  "agent_runs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    agentId: text("agent_id").notNull().references(() => agents.id),
    threadId: text("thread_id").notNull(),
    prompt: text("prompt").notNull(),
    status: text("status", { enum: ["queued", "running", "completed", "failed", "blocked", "cancelled"] }).notNull(),
    requestedBy: text("requested_by").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    confidenceBasisPoints: integer("confidence_basis_points"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (table) => [
    index("agent_runs_org_started_idx").on(table.organizationId, table.startedAt),
    index("agent_runs_agent_idx").on(table.agentId),
    index("agent_runs_thread_idx").on(table.threadId),
  ],
);

export const runItems = sqliteTable(
  "run_items",
  {
    id: text("id").primaryKey(),
    runId: text("run_id").notNull().references(() => agentRuns.id),
    type: text("type").notNull(),
    title: text("title"),
    content: text("content"),
    status: text("status"),
    metadataJson: text("metadata_json"),
    sequence: integer("sequence").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("run_items_run_sequence_idx").on(table.runId, table.sequence)],
);

export const approvalRequests = sqliteTable(
  "approval_requests",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    runId: text("run_id").notNull().references(() => agentRuns.id),
    action: text("action").notNull(),
    riskLevel: text("risk_level").notNull(),
    requestedBy: text("requested_by").notNull(),
    assignedTo: text("assigned_to"),
    status: text("status", { enum: ["pending", "approved", "rejected", "expired"] }).notNull(),
    decisionReason: text("decision_reason"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    decidedAt: integer("decided_at", { mode: "timestamp" }),
  },
  (table) => [
    index("approval_org_status_idx").on(table.organizationId, table.status),
    index("approval_run_idx").on(table.runId),
  ],
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    actor: text("actor").notNull(),
    eventType: text("event_type").notNull(),
    objectType: text("object_type").notNull(),
    objectId: text("object_id").notNull(),
    result: text("result").notNull(),
    traceId: text("trace_id").notNull(),
    payloadHash: text("payload_hash").notNull(),
    metadataJson: text("metadata_json"),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("audit_org_time_idx").on(table.organizationId, table.occurredAt),
    index("audit_trace_idx").on(table.traceId),
    index("audit_event_type_idx").on(table.eventType),
  ],
);

export const knowledgeSources = sqliteTable(
  "knowledge_sources",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    sourceType: text("source_type").notNull(),
    status: text("status").notNull(),
    documentCount: integer("document_count").notNull().default(0),
    effectiveDatePolicy: text("effective_date_policy").notNull().default("strict"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
  },
  (table) => [index("knowledge_org_idx").on(table.organizationId)],
);

