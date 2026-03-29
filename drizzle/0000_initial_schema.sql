CREATE TABLE "integration_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6b7280' NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text DEFAULT '#6b7280' NOT NULL,
	"status" text DEFAULT 'NOT_SYNCED' NOT NULL,
	"last_synced" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integrations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sync_histories" (
	"id" text PRIMARY KEY NOT NULL,
	"integration_id" text NOT NULL,
	"synced_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_history_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"sync_history_id" text NOT NULL,
	"field_name" text NOT NULL,
	"change_type" text NOT NULL,
	"current_value" text,
	"new_value" text,
	"chosen_value" text
);
--> statement-breakpoint
ALTER TABLE "sync_histories" ADD CONSTRAINT "sync_histories_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_history_changes" ADD CONSTRAINT "sync_history_changes_sync_history_id_sync_histories_id_fk" FOREIGN KEY ("sync_history_id") REFERENCES "public"."sync_histories"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "integration_catalog" ("id", "name", "color", "is_custom") VALUES
	('salesforce', 'Salesforce', '#00A1E0', false),
	('hubspot',    'HubSpot',    '#FF7A59', false),
	('stripe',     'Stripe',     '#635BFF', false),
	('slack',      'Slack',      '#4A154B', false),
	('zendesk',    'Zendesk',    '#03363D', false),
	('intercom',   'Intercom',   '#1F8DED', false)
ON CONFLICT ("id") DO NOTHING;