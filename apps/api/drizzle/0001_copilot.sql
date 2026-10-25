CREATE TYPE "public"."coach_memory_kind" AS ENUM('preference', 'fact', 'win', 'weakspot');--> statement-breakpoint
CREATE TYPE "public"."coach_memory_source" AS ENUM('user', 'enes');--> statement-breakpoint
CREATE TYPE "public"."copilot_feedback" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TABLE "coach_memories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "coach_memory_kind" NOT NULL,
	"content" jsonb NOT NULL,
	"source" "coach_memory_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "copilot_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"vertical" text NOT NULL,
	"question" jsonb NOT NULL,
	"reply" jsonb NOT NULL,
	"feedback" "copilot_feedback",
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "copilot_logs_reason_length" CHECK (char_length("copilot_logs"."reason") <= 500)
);
--> statement-breakpoint
ALTER TABLE "coach_memories" ADD CONSTRAINT "coach_memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copilot_logs" ADD CONSTRAINT "copilot_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coach_memories_user_id_created_at_idx" ON "coach_memories" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "coach_memories_expires_at_idx" ON "coach_memories" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "copilot_logs_user_id_created_at_idx" ON "copilot_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "copilot_logs_created_at_idx" ON "copilot_logs" USING btree ("created_at");