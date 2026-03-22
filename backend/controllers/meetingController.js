import { db } from '../db/index.js';
import { meetings, guests, availabilities } from '../db/schema.js';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

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

// 1. Fetch meeting details for the voting page
export const getMeetingForGuest = async (req, res) => {
  try {
    const { guestSlug } = req.params;
    const meetingResult = await db.select().from(meetings).where(eq(meetings.guestSlug, guestSlug));
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "Meeting not found or link is invalid." });
    }
    res.status(200).json(meetingResult[0]);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ error: "Failed to fetch meeting details" });
  }
};

// 2. Save the guest's selected time blocks
export const submitGuestVote = async (req, res) => {
  try {
    const { guestSlug } = req.params;
    const { name, email, availabilities: guestTimes } = req.body;
    const meetingResult = await db.select().from(meetings).where(eq(meetings.guestSlug, guestSlug));
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "Meeting not found." });
    }
    const meeting = meetingResult[0];

    if (meeting.status === 'CONFIRMED') {
      return res.status(400).json({ error: "This meeting has already been finalized." });
    }
    const newGuest = await db.insert(guests).values({
      meetingId: meeting.id,
      name,
      email
    }).returning();
    const guestId = newGuest[0].id;
    const timeBlocksToInsert = guestTimes.map(time => ({
      guestId,
      meetingId: meeting.id,
      startTime: new Date(time.startTime),
      endTime: new Date(time.endTime)
    }));

    await db.insert(availabilities).values(timeBlocksToInsert);
    res.status(201).json({ message: "Availability submitted successfully!" });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ error: "Failed to submit availability" });
  }
};

// 3. Fetch all data for the Admin Dashboard Heatmap
export const getDashboardData = async (req, res) => {
  try {
    const { adminSlug } = req.params;
    const meetingResult = await db.select().from(meetings).where(eq(meetings.adminSlug, adminSlug));
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "Admin dashboard not found or link is invalid." });
    }
    const meeting = meetingResult[0];
    const meetingGuests = await db.select().from(guests).where(eq(guests.meetingId, meeting.id));
    const meetingAvailabilities = await db.select().from(availabilities).where(eq(availabilities.meetingId, meeting.id));
    const guestsWithTimes = meetingGuests.map(guest => {
      return {
        ...guest,
        availabilities: meetingAvailabilities.filter(a => a.guestId === guest.id)
      };
    });
    res.status(200).json({
      meeting,
      guests: guestsWithTimes
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};

// 4. Host confirms the final meeting time
export const confirmMeeting = async (req, res) => {
  try {
    const { adminSlug } = req.params;
    const { finalStartTime, finalEndTime } = req.body;
    const updatedMeeting = await db.update(meetings)
      .set({ 
        status: 'CONFIRMED', 
        finalStartTime: new Date(finalStartTime), 
        finalEndTime: new Date(finalEndTime) 
      })
      .where(eq(meetings.adminSlug, adminSlug))
      .returning();
    if (updatedMeeting.length === 0) {
      return res.status(404).json({ error: "Meeting not found." });
    }
    res.status(200).json({ 
      message: "Meeting officially confirmed!", 
      meeting: updatedMeeting[0] 
    });
  } catch (error) {
    console.error("Error confirming meeting:", error);
    res.status(500).json({ error: "Failed to confirm meeting" });
  }
};