CREATE TABLE `integration_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6b7280' NOT NULL,
	`is_custom` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text DEFAULT '#6b7280' NOT NULL,
	`status` text DEFAULT 'NOT_SYNCED' NOT NULL,
	-- valid values: NOT_SYNCED | SYNCED | CONFLICT | SYNCING | ERROR
	`last_synced` integer,
	`version` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `integrations_slug_unique` ON `integrations` (`slug`);--> statement-breakpoint
CREATE TABLE `sync_histories` (
	`id` text PRIMARY KEY NOT NULL,
	`integration_id` text NOT NULL,
	`synced_at` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sync_history_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`sync_history_id` text NOT NULL,
	`field_name` text NOT NULL,
	`change_type` text NOT NULL,
	`current_value` text,
	`new_value` text,
	`chosen_value` text,
	FOREIGN KEY (`sync_history_id`) REFERENCES `sync_histories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `integration_catalog` (`id`, `name`, `color`, `is_custom`) VALUES
	('salesforce', 'Salesforce', '#00A1E0', 0),
	('hubspot',    'HubSpot',    '#FF7A59', 0),
	('stripe',     'Stripe',     '#635BFF', 0),
	('slack',      'Slack',      '#4A154B', 0),
	('zendesk',    'Zendesk',    '#03363D', 0),
	('intercom',   'Intercom',   '#1F8DED', 0);
