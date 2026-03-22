import { getStoredAuthToken } from "@/store/useAuthStore";

const API_BASE_URL = "http://localhost:5000/api";

function jsonHeadersWithAuth(): HeadersInit {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function getHeadersWithAuth(): HeadersInit {
  const token = getStoredAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
      details?: { message?: string }[];
    };
    if (typeof data.error === "string") {
      const first = data.details?.[0]?.message;
      return first ? `${data.error}: ${first}` : data.error;
    }
    if (typeof data.message === "string") return data.message;
  } catch {
    /* ignore */
  }
  return response.statusText || "Request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return response.json() as Promise<T>;
}

export interface CreateMeetingBody {
  title: string;
  description: string;
  durationMinutes: number;
  proposedDates: string[];
}

export interface CreateMeetingResponse {
  links: { guestLink: string; adminLink: string };
}

export async function createMeeting(data: CreateMeetingBody): Promise<CreateMeetingResponse> {
  return parseJson(
    await fetch(`${API_BASE_URL}/meetings`, {
      method: "POST",
      headers: jsonHeadersWithAuth(),
      body: JSON.stringify(data),
    })
  );
}

/** Public meeting payload for guest voting (GET /meetings/guest/:guestSlug) */
export interface MeetingForGuest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  proposedDates: string[];
  guestSlug: string;
  status: string;
}

export async function getMeeting(guestSlug: string): Promise<MeetingForGuest> {
  return parseJson(
    await fetch(
      `${API_BASE_URL}/meetings/guest/${encodeURIComponent(guestSlug)}`
    )
  );
}

export interface SubmitVoteBody {
  name: string;
  email?: string;
  availabilities: { startTime: string; endTime: string }[];
}

export async function submitVote(guestSlug: string, data: SubmitVoteBody) {
  return parseJson(
    await fetch(
      `${API_BASE_URL}/meetings/guest/${encodeURIComponent(guestSlug)}/vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
  );
}

export interface DashboardGuestRow {
  id: string;
  name: string;
  email?: string | null;
  availabilities: { startTime: string; endTime: string }[];
}

export interface DashboardMeetingRow {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  proposedDates: string[];
  guestSlug: string;
  status: string;
}

export interface DashboardData {
  meeting: DashboardMeetingRow;
  guests: DashboardGuestRow[];
}

export async function getDashboardData(adminSlug: string): Promise<DashboardData> {
  return parseJson(
    await fetch(`${API_BASE_URL}/meetings/admin/${encodeURIComponent(adminSlug)}`, {
      headers: getHeadersWithAuth(),
    })
  );
}

export interface ConfirmMeetingBody {
  finalStartTime: string;
  finalEndTime: string;
}

export async function confirmMeeting(adminSlug: string, data: ConfirmMeetingBody) {
  return parseJson(
    await fetch(
      `${API_BASE_URL}/meetings/admin/${encodeURIComponent(adminSlug)}/confirm`,
      {
        method: "POST",
        headers: jsonHeadersWithAuth(),
        body: JSON.stringify(data),
      }
    )
  );
}
