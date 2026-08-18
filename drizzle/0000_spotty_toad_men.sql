CREATE TABLE `agent_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`prompt` text NOT NULL,
	`status` text NOT NULL,
	`requested_by` text NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`confidence_basis_points` integer,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `agent_runs_org_started_idx` ON `agent_runs` (`organization_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `agent_runs_agent_idx` ON `agent_runs` (`agent_id`);--> statement-breakpoint
CREATE INDEX `agent_runs_thread_idx` ON `agent_runs` (`thread_id`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`version` text NOT NULL,
	`status` text NOT NULL,
	`instructions` text NOT NULL,
	`approval_mode` text DEFAULT 'risk-based' NOT NULL,
	`sandbox_policy` text DEFAULT 'workspace-write' NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `agents_org_idx` ON `agents` (`organization_id`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`run_id` text NOT NULL,
	`action` text NOT NULL,
	`risk_level` text NOT NULL,
	`requested_by` text NOT NULL,
	`assigned_to` text,
	`status` text NOT NULL,
	`decision_reason` text,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `approval_org_status_idx` ON `approval_requests` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `approval_run_idx` ON `approval_requests` (`run_id`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`actor` text NOT NULL,
	`event_type` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`result` text NOT NULL,
	`trace_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`metadata_json` text,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_org_time_idx` ON `audit_events` (`organization_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_trace_idx` ON `audit_events` (`trace_id`);--> statement-breakpoint
CREATE INDEX `audit_event_type_idx` ON `audit_events` (`event_type`);--> statement-breakpoint
CREATE TABLE `knowledge_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`source_type` text NOT NULL,
	`status` text NOT NULL,
	`document_count` integer DEFAULT 0 NOT NULL,
	`effective_date_policy` text DEFAULT 'strict' NOT NULL,
	`last_synced_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `knowledge_org_idx` ON `knowledge_sources` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region` text DEFAULT 'CN' NOT NULL,
	`data_residency` text DEFAULT 'CN' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_name_idx` ON `organizations` (`name`);--> statement-breakpoint
CREATE TABLE `run_items` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`content` text,
	`status` text,
	`metadata_json` text,
	`sequence` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `run_items_run_sequence_idx` ON `run_items` (`run_id`,`sequence`);