CREATE TABLE IF NOT EXISTS "likes" (
	"twitsnap_id" uuid NOT NULL,
	"liked_by" uuid,
	CONSTRAINT "likes_twitsnap_id_liked_by_pk" PRIMARY KEY("twitsnap_id","liked_by")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_twitsnap_id_twitsnaps_id_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
