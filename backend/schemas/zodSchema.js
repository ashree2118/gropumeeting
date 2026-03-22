import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive("Duration must be a positive number"),
  proposedDates: z.array(z.string()).min(1, "Please select at least one date") 
});

export const submitVoteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal('')), 
  availabilities: z.array(
    z.object({
      startTime: z.string().datetime(), // Ensures it's a valid ISO 8601 timestamp
      endTime: z.string().datetime()
    })
  ).min(1, "Please select at least one time slot")
});

export const confirmMeetingSchema = z.object({
  finalStartTime: z.string().datetime(),
  finalEndTime: z.string().datetime()
});