CREATE TABLE IF NOT EXISTS "mentions" (
	"twitsnap_id" uuid NOT NULL,
	"user_mentioned" uuid NOT NULL,
	CONSTRAINT "mentions_twitsnap_id_user_mentioned_pk" PRIMARY KEY("twitsnap_id","user_mentioned")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentions" ADD CONSTRAINT "mentions_twitsnap_id_twitsnaps_id_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
