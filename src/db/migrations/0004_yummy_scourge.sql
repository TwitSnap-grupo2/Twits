CREATE TABLE IF NOT EXISTS "snapshares" (
	"twitsnap_id" uuid NOT NULL,
	"shared_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "snapshares" ADD CONSTRAINT "snapshares_twitsnap_id_twitsnaps_id_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
