CREATE TABLE "coach_memories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"content" jsonb NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "coach_memories_kind_valid" CHECK ("coach_memories"."kind" in ('preference', 'fact', 'win', 'weakspot')),
	CONSTRAINT "coach_memories_source_valid" CHECK ("coach_memories"."source" in ('user', 'enes'))
);
--> statement-breakpoint
CREATE TABLE "copilot_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vertical" text NOT NULL,
	"question" jsonb NOT NULL,
	"reply" jsonb NOT NULL,
	"feedback" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "copilot_logs_feedback_valid" CHECK ("copilot_logs"."feedback" is null or "copilot_logs"."feedback" in ('up', 'down')),
	CONSTRAINT "copilot_logs_reason_length" CHECK (char_length("copilot_logs"."reason") <= 500)
);
--> statement-breakpoint
ALTER TABLE "coach_memories" ADD CONSTRAINT "coach_memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copilot_logs" ADD CONSTRAINT "copilot_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coach_memories_user_id_created_at_idx" ON "coach_memories" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "coach_memories_expires_at_idx" ON "coach_memories" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "copilot_logs_user_id_created_at_idx" ON "copilot_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "copilot_logs_created_at_idx" ON "copilot_logs" USING btree ("created_at");