CREATE TABLE IF NOT EXISTS "favourites" (
	"twitsnap_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "favourites_twitsnap_id_user_id_pk" PRIMARY KEY("twitsnap_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favourites" ADD CONSTRAINT "favourites_twitsnap_id_twitsnaps_id_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
