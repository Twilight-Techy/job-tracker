CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"job_title" text NOT NULL,
	"country" text,
	"location" text,
	"type" text,
	"work_mode" text,
	"application_link" text,
	"deadline" timestamp,
	"date_applied" timestamp,
	"status" text,
	"feedback_date" timestamp,
	"source" text,
	"priority" text,
	"referral_used" boolean,
	"currency" text,
	"estimated_monthly_salary_original" integer,
	"estimated_monthly_salary_usd" integer,
	"estimated_monthly_salary_ngn" integer,
	"resume_used_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"content" json,
	"created_at" timestamp DEFAULT now()
);
