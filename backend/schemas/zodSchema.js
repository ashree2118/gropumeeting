import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive("Duration must be a positive number"),
  proposedDates: z.array(z.string()).min(1, "Please select at least one date") 
});