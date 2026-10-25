CREATE TABLE "logbook_months" (
	"user_id" uuid NOT NULL,
	"month" text NOT NULL,
	"payload" jsonb NOT NULL,
	"rev" integer NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "logbook_months_user_id_month_pk" PRIMARY KEY("user_id","month"),
	CONSTRAINT "logbook_months_month_valid" CHECK ("logbook_months"."month" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
	CONSTRAINT "logbook_months_rev_positive" CHECK ("logbook_months"."rev" > 0)
);
--> statement-breakpoint
CREATE TABLE "logbook_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"rev" integer NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "logbook_profiles_rev_positive" CHECK ("logbook_profiles"."rev" > 0)
);
--> statement-breakpoint
ALTER TABLE "logbook_months" ADD CONSTRAINT "logbook_months_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logbook_profiles" ADD CONSTRAINT "logbook_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logbook_months_user_id_updated_at_idx" ON "logbook_months" USING btree ("user_id","updated_at");