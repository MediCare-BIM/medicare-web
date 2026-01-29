import { create } from 'zustand';

export type View = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface CalendarState {
  view: View;
  date: Date;
  searchQuery: string;
  selectedAppointmentId: string | null;
  setView: (view: View) => void;
  setDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setSelectedAppointmentId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  view: 'timeGridWeek' as View,
  date: new Date(),
  searchQuery: '',
  selectedAppointmentId: null,
};

export const useCalendarStore = create<CalendarState>((set) => ({
  ...initialState,
  setView: (view) => set({ view }),
  setDate: (date) => set({ date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedAppointmentId: (id) => set({ selectedAppointmentId: id }),
  reset: () => set(initialState),
}));
