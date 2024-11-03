CREATE TABLE IF NOT EXISTS "twitsnaps_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"in_response_to_id" uuid NOT NULL,
	"content" varchar(280) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twitsnaps_responses" ADD CONSTRAINT "twitsnaps_responses_in_response_to_id_twitsnaps_id_fk" FOREIGN KEY ("in_response_to_id") REFERENCES "public"."twitsnaps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
