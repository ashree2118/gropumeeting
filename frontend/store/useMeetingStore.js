import { create } from 'zustand';
import { createMeeting } from '../lib/api';

export const useMeetingStore = create((set, get) => ({
  title: '',
  description: '',
  durationMinutes: 30,
  proposedDates: [],
  guestLink: null,
  adminLink: null,  
  isLoading: false,
  error: null,

  setBasicInfo: (title, description, durationMinutes) => 
    set({ title, description, durationMinutes }),
    
  setDates: (dates) => 
    set({ proposedDates: dates }),
  submitMeeting: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const response = await createMeeting({
        title: state.title,
        description: state.description,
        durationMinutes: state.durationMinutes,
        proposedDates: state.proposedDates
      });
      set({ 
        guestLink: response.links.guestLink, 
        adminLink: response.links.adminLink,
        isLoading: false 
      });     
      return true;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },
  resetStore: () => set({
    title: '', description: '', durationMinutes: 30, proposedDates: [], guestLink: null, adminLink: null, error: null
  })
}));