import { db } from '../db/index.js';
import { GoogleGenAI } from "@google/genai";
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

    // Block past dates
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (Array.isArray(proposedDates) && proposedDates.every(d => d < todayStr)) {
      return res.status(400).json({ error: "Cannot schedule in the past" });
    }

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

    // Block confirming a time in the past
    if (new Date(finalStartTime) < new Date()) {
      return res.status(400).json({ error: "Cannot schedule in the past" });
    }

    const meetingResult = await db.select().from(meetings).where(eq(meetings.id, meetingId));
    if (meetingResult.length === 0 || meetingResult[0].hostId !== hostId) {
      return res.status(403).json({ error: "Unauthorized or meeting not found." });
    }
    const calculatedEndTime = new Date(
      new Date(finalStartTime).getTime() + meetingResult[0].durationMinutes * 60000
    );

    const hostResult = await db.select().from(users).where(eq(users.id, hostId));
    const host = hostResult[0];
    const meetingGuests = await db.select().from(guests).where(eq(guests.meetingId, meetingId));

    // Auto-generate Google Meet link and inject into host's calendar
    let meetLink = null;
    let aiNotes = null;
    try {
      // Generate AI notes using GenAI
      try {
        if (process.env.GOOGLE_API_KEY) {
          const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
          const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const prompt = `Generate a concise meeting summary (2-3 sentences) for a meeting titled "${meetingResult[0].title}" with description "${meetingResult[0].description || 'No description provided'}". Include key discussion points and objectives.`;
          
          const result = await model.generateContent(prompt);
          aiNotes = result.response.text();
          console.log("✅ AI Notes Generated:", aiNotes);
        }
      } catch (genaiError) {
        console.log("⚠️ GenAI notes generation skipped:", genaiError.message);
        // Continue without AI notes if genai fails
      }

      if (host?.googleRefreshToken) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'postmessage'
        );
        oauth2Client.setCredentials({ refresh_token: host.googleRefreshToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
          summary: meetingResult[0].title,
          description: aiNotes || meetingResult[0].description || 'Scheduled via Meetrix',
          start: { dateTime: new Date(finalStartTime).toISOString(), timeZone: 'UTC' },
          end: { dateTime: calculatedEndTime.toISOString(), timeZone: 'UTC' },
          attendees: meetingGuests.filter(g => g.email).map(g => ({ email: g.email })),
          conferenceData: {
            createRequest: {
              requestId: `meetrix-${meetingId}-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };

        const eventResponse = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all'
        });

        // Extract the Meet link (best effort)
        meetLink = eventResponse.data.hangoutLink || meetLink;

        const conferenceData = eventResponse.data.conferenceData;
        if (!meetLink && conferenceData && conferenceData.entryPoints) {
          const meetEntry = conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
          if (meetEntry) {
            meetLink = meetEntry.uri;
          }
        }
      }
    } catch (calendarError) {
      console.error("Failed to create calendar event with Meet link:", calendarError.message);
      // Continue without Meet link if calendar fails
    }

    const updatedMeetingResult = await db.update(meetings)
      .set({ 
        status: 'CONFIRMED', 
        finalStartTime: new Date(finalStartTime), 
        finalEndTime: calculatedEndTime
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    const confirmedMeeting = updatedMeetingResult[0];

    sendMeetingConfirmation(confirmedMeeting, host, meetingGuests, meetLink, aiNotes);
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

export const getSmartArbitrator = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const hostId = req.user.id;

    console.log("🤖 Smart Arbitrator Request:", { meetingId, hostId });

    // 1. Fetch meeting and verify ownership
    const meetingResult = await db.select().from(meetings).where(eq(meetings.id, meetingId));
    if (meetingResult.length === 0 || meetingResult[0].hostId !== hostId) {
      return res.status(403).json({ error: "Unauthorized or meeting not found" });
    }
    const meeting = meetingResult[0];

    // 2. Fetch all guests and their availabilities
    const meetingGuests = await db.select().from(guests).where(eq(guests.meetingId, meetingId));
    const allAvailabilities = await db.select().from(availabilities).where(eq(availabilities.meetingId, meetingId));

    console.log(`📊 Meeting: ${meeting.title}, Guests: ${meetingGuests.length}, Availabilities: ${allAvailabilities.length}`);
    console.log("👥 Guests:", meetingGuests.map(g => ({ id: g.id, name: g.name })));
    console.log("📅 Availabilities:", allAvailabilities.map(a => ({ 
      guestId: a.guestId, 
      startTime: a.startTime, 
      endTime: a.endTime 
    })));
    console.log("📆 Proposed Dates:", meeting.proposedDates);

    // Early return if no guests have responded at all
    if (allAvailabilities.length === 0) {
      console.log("⚠️ No availability responses yet");
      return res.status(200).json([{
        suggestedStartTime: null,
        attendeeCount: 0,
        explanation: "No guests have responded with their availability yet. Please wait for responses before asking for suggestions.",
        missingGuests: meetingGuests.map(g => g.name),
        noData: true
      }]);
    }

    // 3. Group availabilities by guest
    const guestAvailabilityMap = {};
    meetingGuests.forEach(guest => {
      guestAvailabilityMap[guest.id] = {
        name: guest.name,
        availabilities: allAvailabilities
          .filter(a => a.guestId === guest.id)
          .map(a => ({ start: new Date(a.startTime).getTime(), end: new Date(a.endTime).getTime() }))
      };
    });

    // 4. Generate candidate time slots from actual guest availability windows
    //    Instead of hardcoded 8am-6pm (which has timezone issues), we derive
    //    candidate start times from the actual availability data guests submitted.
    const durationMs = meeting.durationMinutes * 60000;
    const candidateStartsSet = new Set();

    for (const avail of allAvailabilities) {
      const availStartMs = new Date(avail.startTime).getTime();
      const availEndMs = new Date(avail.endTime).getTime();
      // Generate 30-min candidate slots within this availability window
      for (let t = availStartMs; t + durationMs <= availEndMs; t += 30 * 60000) {
        candidateStartsSet.add(t);
      }
    }

    const timeSlots = [];
    for (const startMs of candidateStartsSet) {
      const slotEnd = startMs + durationMs;

      let attendeeCount = 0;
      const missingGuests = [];

      for (const guest of meetingGuests) {
        const guestAvail = guestAvailabilityMap[guest.id];

        const canAttend = guestAvail.availabilities.length > 0 && guestAvail.availabilities.some(avail => {
          return startMs >= avail.start && slotEnd <= avail.end;
        });

        if (canAttend) {
          attendeeCount++;
        } else {
          missingGuests.push(guest.name);
        }
      }

      timeSlots.push({
        startMs,
        attendeeCount,
        missingGuests
      });
    }

    // 5. Filter out slots with 0 attendees, then sort by attendee count (descending) and pick top 3
    const slotsWithAttendees = timeSlots
      .filter(s => s.attendeeCount > 0)
      .sort((a, b) => b.attendeeCount - a.attendeeCount);

    // Deduplicate: avoid suggesting slots that are very close in time (within 30 min of each other)
    const topSlots = [];
    for (const slot of slotsWithAttendees) {
      const tooClose = topSlots.some(s => Math.abs(s.startMs - slot.startMs) < 30 * 60000);
      if (!tooClose) {
        topSlots.push(slot);
      }
      if (topSlots.length >= 3) break;
    }

    console.log(`✅ Found ${timeSlots.length} total slots, ${slotsWithAttendees.length} with attendees, returning top ${topSlots.length}`);

    if (topSlots.length === 0) {
      // All guests responded but no overlapping times found
      return res.status(200).json([{
        suggestedStartTime: null,
        attendeeCount: 0,
        explanation: "No overlapping availability found among the guests who responded. Consider proposing new dates or asking guests to expand their availability.",
        missingGuests: meetingGuests.map(g => g.name),
        noData: true
      }]);
    }

    // 6. Use GenAI to generate explanations for top slots
    const suggestions = [];
    for (const slot of topSlots) {
      const slotDate = new Date(slot.startMs);
      let explanation = `${slot.attendeeCount} out of ${meetingGuests.length} guests can attend this time.`;
      
      try {
        if (process.env.GOOGLE_API_KEY) {
          const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
          const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const prompt = `Generate a concise, polite 1-sentence explanation for why ${slotDate.toLocaleString()} is a good meeting time. ${slot.attendeeCount} out of ${meetingGuests.length} attendees can make it. Keep it under 20 words.`;
          const result = await model.generateContent(prompt);
          explanation = result.response.text().trim();
        }
      } catch (genaiError) {
        console.log("⚠️ GenAI explanation generation skipped:", genaiError.message);
      }

      suggestions.push({
        suggestedStartTime: slotDate.toISOString(),
        attendeeCount: slot.attendeeCount,
        missingGuests: slot.missingGuests.length > 0 ? slot.missingGuests : undefined,
        explanation
      });
    }

    console.log("🎯 Returning suggestions:", suggestions.length);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error("❌ Smart Arbitrator Error:", error);
    res.status(500).json({ error: "Failed to analyze availability", details: error.message });
  }
};