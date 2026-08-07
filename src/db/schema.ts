import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References neon_auth.user.id
  company: text("company").notNull(),
  jobTitle: text("job_title").notNull(),
  country: text("country"),
  location: text("location"),
  type: text("type"), // Freelance, Full-time, Part-time, Contract
  level: text("level"), // Internship, Entry-level, Mid-level, Senior, Executive
  workMode: text("work_mode"), // Remote, On Site, Hybrid
  sponsorshipOffered: boolean("sponsorship_offered").default(false),
  applicationLink: text("application_link"),
  deadline: timestamp("deadline"),
  dateApplied: timestamp("date_applied"),
  status: text("status"), // Applied, Interview, Offer, Rejected, etc.
  feedbackDate: timestamp("feedback_date"),
  source: text("source"),
  priority: text("priority"), // High, Medium, Low
  referralUsed: boolean("referral_used"),
  currency: text("currency"),
  estimatedMonthlySalaryOriginal: integer("estimated_monthly_salary_original"),
  resumeUsedId: integer("resume_used_id"), // Reference to resumes.id
  requirements: text("requirements"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References neon_auth.user.id
  name: text("name").notNull(),
  type: text("type").default("builder"), // 'builder', 'upload', 'link'
  fileUrl: text("file_url"), // For Blob URLs or External Links
  content: json("content"), // structured data for the resume builder
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(), // References neon_auth.user.id
  apiKey: text("api_key").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const baseContexts = pgTable("base_contexts", {
  userId: text("user_id").primaryKey(), // References neon_auth.user.id
  content: text("content").notNull(), // Flexible unstructured markdown/text context
  updatedAt: timestamp("updated_at").defaultNow(),
});
