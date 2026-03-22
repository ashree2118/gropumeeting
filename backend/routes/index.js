import { Router } from 'express';
import { validateData } from '../middlewares/validateData.js';
import { createMeetingSchema } from '../schemas/zodSchema.js';
import * as meetingController from '../controllers/meetingController.js';

const router = Router();

router.post('/meetings', validateData(createMeetingSchema), meetingController.createMeeting);

export default router;