import { db } from '../db/index.js';
import { meetings } from '../db/schema.js';
import { nanoid } from 'nanoid';

export const createMeeting = async (req, res) => {
  try {
    const { title, description, durationMinutes, proposedDates } = req.body;
    const guestSlug = nanoid(10);
    const adminSlug = nanoid(10);
    const newMeeting = await db.insert(meetings).values({
      title,
      description,
      durationMinutes,
      proposedDates,
      guestSlug,
      adminSlug,
      status: 'PENDING'
    }).returning();

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: newMeeting[0],
      links: {
        guestLink: `/m/${guestSlug}`,
        adminLink: `/dashboard/${adminSlug}` 
      }
    });

  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
};