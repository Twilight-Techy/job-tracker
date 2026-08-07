CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"api_key" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_api_key_unique" UNIQUE("api_key")
);
