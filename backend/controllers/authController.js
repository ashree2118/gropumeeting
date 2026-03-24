import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body; // Auth code from the frontend

    // Exchange the authorization code for tokens
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'postmessage');
    const { tokens } = await oauth2Client.getToken(code);

    // Verify the id_token to get user profile info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let userResult = await db.select().from(users).where(eq(users.googleId, payload.sub));
    let user = userResult[0];

    if (user) {
      // User exists — update refresh token if a new one was provided
      if (tokens.refresh_token) {
        await db.update(users)
          .set({ googleRefreshToken: tokens.refresh_token })
          .where(eq(users.googleId, payload.sub));
        user.googleRefreshToken = tokens.refresh_token;
      }
    } else {
      // New user — insert with refresh token
      const newUser = await db.insert(users).values({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleRefreshToken: tokens.refresh_token || null,
      }).returning();
      user = newUser[0];
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};