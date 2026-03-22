import { Router } from 'express';
import { validateData } from '../middlewares/validateData.js';
import { createMeetingSchema, submitVoteSchema, confirmMeetingSchema } from '../schemas/zodSchema.js'; 
import * as meetingController from '../controllers/meetingController.js';

const router = Router();

// HOST: Create a new meeting
router.post('/meetings', validateData(createMeetingSchema), meetingController.createMeeting);

// GUEST: Load the meeting data using the slug
router.get('/meetings/:guestSlug', meetingController.getMeetingForGuest);

// GUEST: Submit available times
router.post('/meetings/:guestSlug/vote', validateData(submitVoteSchema), meetingController.submitGuestVote);

// ADMIN: Get all data for the heatmap dashboard  <-- NEW
router.get('/meetings/admin/:adminSlug', meetingController.getDashboardData);

// ADMIN: Confirm the final time <-- NEW
router.post('/meetings/admin/:adminSlug/confirm', validateData(confirmMeetingSchema), meetingController.confirmMeeting);

export default router;