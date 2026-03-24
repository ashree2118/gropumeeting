import { pgTable, text, timestamp, integer, uuid, jsonb } from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  picture: text("picture"),
  googleRefreshToken: text("google_refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Meetings Table
export const meetings = pgTable("meetings", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id").references(() => users.id, { onDelete: 'cascade' }).notNull(), // <-- NEW: Links meeting to host
  title: text("title").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(), 
  guestSlug: text("guest_slug").notNull().unique(), 
  proposedDates: jsonb("proposed_dates").notNull(), 
  status: text("status").default("PENDING").notNull(), 
  finalStartTime: timestamp("final_start_time", { withTimezone: true }),
  finalEndTime: timestamp("final_end_time", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. The Guests Table
export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  email: text("email"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. The Availabilities Table
export const availabilities = pgTable("availabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
});