CREATE TABLE IF NOT EXISTS "hashtags" (
	"twitsnap_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "hashtags_twitsnap_id_name_pk" PRIMARY KEY("twitsnap_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "twitsnaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(280) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_private" boolean NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "likes"(
	"twitsnap_id" uuid NOT NULL,
	"liked_by" uuid NOT NULL,
	CONSTRAINT "likes_twitsnap_id_user_id_pk" PRIMARY KEY("twitsnap_id","user_id")
);


--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "snapshares"(
	"twitsnap_id" uuid NOT NULL,
	"shared_by" uuid NOT NULL,
	"shared_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "snapshares_twitsnap_id_user_id_pk" PRIMARY KEY("twitsnap_id","shared_by")
)

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hashtags" ADD CONSTRAINT "hashtags_twitsnap_id_twitsnaps_id_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hashtag_twitsnap_idx" ON "hashtags" USING btree ("twitsnap_id","name");

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_twitsnap_id_liked_by_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "snapshares" ADD CONSTRAINT "snapshares_twitsnap_id_shared_by_fk" FOREIGN KEY ("twitsnap_id") REFERENCES "public"."twitsnaps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;