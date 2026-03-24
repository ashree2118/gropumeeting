import { db } from '../db/index.js';
import { meetings, guests, availabilities } from '../db/schema.js';
import { nanoid } from 'nanoid';
import { eq, and, desc } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { sendMeetingConfirmation } from '../utils/email.js';
import { google } from 'googleapis';

export const createMeeting = async (req, res) => {
  try {
    const { title, description, durationMinutes, proposedDates } = req.body;
    const hostId = req.user.id; 
    const guestSlug = nanoid(10); 
    const newMeeting = await db.insert(meetings).values({
      hostId,
      title,
      description,
      durationMinutes,
      proposedDates,
      guestSlug,
      status: 'PENDING'
    }).returning();

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: newMeeting[0],
      links: {
        guestLink: `/m/${guestSlug}`, 
        adminLink: `/dashboard/${newMeeting[0].id}` 
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
    const { guestId } = req.query;
    const meetingResult = await db.select().from(meetings).where(eq(meetings.guestSlug, guestSlug));
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "Meeting not found or link is invalid." });
    }
    const meeting = meetingResult[0];

    // --- Fetch host's Google Calendar busy times ---
    let hostBusyTimes = [];
    try {
      const hostResult = await db.select().from(users).where(eq(users.id, meeting.hostId));
      const host = hostResult[0];

      if (host && host.googleRefreshToken) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'postmessage'
        );
        oauth2Client.setCredentials({ refresh_token: host.googleRefreshToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Widen the search window to handle UTC offset mismatches
        const firstDate = new Date(meeting.proposedDates[0]);
        const lastDate = new Date(meeting.proposedDates[meeting.proposedDates.length - 1]);

        // Subtract 24 hours to ensure we don't miss morning events due to UTC offsets
        const timeMin = new Date(firstDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
        // Add 48 hours to ensure we cover the entire final day across all timezones
        const timeMax = new Date(lastDate.getTime() + 48 * 60 * 60 * 1000).toISOString();

        const freebusyRes = await calendar.freebusy.query({
          requestBody: {
            timeMin,
            timeMax,
            items: [{ id: 'primary' }],
          },
        });

        const busySlots = freebusyRes.data.calendars.primary.busy || [];
        console.log("🔍 GOOGLE BUSY DATA:", JSON.stringify(busySlots));
        hostBusyTimes = busySlots.map(slot => ({ start: slot.start, end: slot.end }));
      }
    } catch (calendarError) {
      console.error("Calendar sync error (non-fatal):", calendarError.message);
      hostBusyTimes = [];
    }

    // If a guestId is provided, fetch that guest's existing data
    if (guestId) {
      const guestResult = await db.select().from(guests)
        .where(and(eq(guests.id, guestId), eq(guests.meetingId, meeting.id)));
      if (guestResult.length > 0) {
        const guest = guestResult[0];
        const guestAvailabilities = await db.select().from(availabilities)
          .where(eq(availabilities.guestId, guest.id));
        return res.status(200).json({
          ...meeting,
          hostBusyTimes,
          guest: {
            id: guest.id,
            name: guest.name,
            email: guest.email,
            availabilities: guestAvailabilities
          }
        });
      }
    }

    res.status(200).json({ ...meeting, hostBusyTimes });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ error: "Failed to fetch meeting details" });
  }
};

// 2. Save the guest's selected time blocks
export const submitGuestVote = async (req, res) => {
  try {
    const { guestSlug } = req.params;
    const { name, email, availabilities: guestTimes, guestId } = req.body;
    const meetingResult = await db.select().from(meetings).where(eq(meetings.guestSlug, guestSlug));
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "Meeting not found." });
    }
    const meeting = meetingResult[0];

    if (meeting.status === 'CONFIRMED') {
      return res.status(400).json({ error: "This meeting has already been finalized." });
    }

    let currentGuestId = guestId;

    if (currentGuestId) {
      // Verify the guest belongs to this meeting
      const existingGuest = await db.select().from(guests)
        .where(and(eq(guests.id, currentGuestId), eq(guests.meetingId, meeting.id)));
      if (existingGuest.length === 0) {
        return res.status(400).json({ error: "Guest not found for this meeting." });
      }
      // Update guest info
      await db.update(guests)
        .set({ name, email })
        .where(eq(guests.id, currentGuestId));
      // Delete old availabilities
      await db.delete(availabilities)
        .where(eq(availabilities.guestId, currentGuestId));
    } else {
      // Insert new guest
      const newGuest = await db.insert(guests).values({
        meetingId: meeting.id,
        name,
        email
      }).returning();
      currentGuestId = newGuest[0].id;
    }

    const timeBlocksToInsert = guestTimes.map(time => ({
      guestId: currentGuestId,
      meetingId: meeting.id,
      startTime: new Date(time.startTime),
      endTime: new Date(time.endTime)
    }));

    await db.insert(availabilities).values(timeBlocksToInsert);
    res.status(200).json({ message: "Availability submitted successfully!", guestId: currentGuestId });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ error: "Failed to submit availability" });
  }
};

// 3. Fetch all data for the Admin Dashboard Heatmap
export const getDashboardData = async (req, res) => {
  try {
    const { meetingId } = req.params; 
    const hostId = req.user.id;
    const meetingResult = await db.select().from(meetings)
      .where(eq(meetings.id, meetingId));

    if (meetingResult.length === 0 || meetingResult[0].hostId !== hostId) {
      return res.status(403).json({ error: "Unauthorized or meeting not found." });
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
    res.status(200).json({ meeting, guests: guestsWithTimes });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};

// 4. Host confirms the final meeting time
export const confirmMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { finalStartTime } = req.body;
    const hostId = req.user.id; 
    const meetingResult = await db.select().from(meetings).where(eq(meetings.id, meetingId));
    if (meetingResult.length === 0 || meetingResult[0].hostId !== hostId) {
      return res.status(403).json({ error: "Unauthorized or meeting not found." });
    }
    const calculatedEndTime = new Date(
      new Date(finalStartTime).getTime() + meetingResult[0].durationMinutes * 60000
    );
    const updatedMeetingResult = await db.update(meetings)
      .set({ 
        status: 'CONFIRMED', 
        finalStartTime: new Date(finalStartTime), 
        finalEndTime: calculatedEndTime
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    const confirmedMeeting = updatedMeetingResult[0];
    const hostResult = await db.select().from(users).where(eq(users.id, hostId));
    const host = hostResult[0];
    const meetingGuests = await db.select().from(guests).where(eq(guests.meetingId, meetingId));

    sendMeetingConfirmation(confirmedMeeting, host, meetingGuests);
    res.status(200).json({ 
      message: "Meeting officially confirmed!", 
      meeting: confirmedMeeting 
    });
  } catch (error) {
    console.error("Error confirming meeting:", error);
    res.status(500).json({ error: "Failed to confirm meeting" });
  }
};

// 5. Fetch all meetings for the logged-in host
export const getAllHostMeetings = async (req, res) => {
  try {
    const hostId = req.user.id;
    const userMeetings = await db.select()
      .from(meetings)
      .where(eq(meetings.hostId, hostId))
      .orderBy(desc(meetings.createdAt)); 
    res.status(200).json(userMeetings);
  } catch (error) {
    console.error("Error fetching all meetings:", error);
    res.status(500).json({ error: "Failed to load your meetings" });
  }
};