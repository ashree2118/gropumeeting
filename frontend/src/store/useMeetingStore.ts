import { create } from "zustand";
import { createMeeting } from "@/lib/api";

export interface MeetingStoreState {
  title: string;
  description: string;
  durationMinutes: number;
  proposedDates: string[];
  guestLink: string | null;
  adminLink: string | null;
  isLoading: boolean;
  error: string | null;
  setBasicInfo: (
    title: string,
    description: string,
    durationMinutes: number
  ) => void;
  setDates: (dates: string[]) => void;
  submitMeeting: () => Promise<boolean>;
  resetStore: () => void;
}

export const useMeetingStore = create<MeetingStoreState>((set, get) => ({
  title: "",
  description: "",
  durationMinutes: 30,
  proposedDates: [],
  guestLink: null,
  adminLink: null,
  isLoading: false,
  error: null,

  setBasicInfo: (title, description, durationMinutes) =>
    set({ title, description, durationMinutes }),

  setDates: (dates) => set({ proposedDates: dates }),

  submitMeeting: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const response = await createMeeting({
        title: state.title,
        description: state.description,
        durationMinutes: state.durationMinutes,
        proposedDates: state.proposedDates,
      });
      set({
        guestLink: response.links.guestLink,
        adminLink: response.links.adminLink,
        isLoading: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create meeting";
      set({ error: message, isLoading: false });
      return false;
    }
  },

  resetStore: () =>
    set({
      title: "",
      description: "",
      durationMinutes: 30,
      proposedDates: [],
      guestLink: null,
      adminLink: null,
      isLoading: false,
      error: null,
    }),
}));
