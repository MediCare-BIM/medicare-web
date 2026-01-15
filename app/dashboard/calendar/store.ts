import { create } from 'zustand';

export type View = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface CalendarState {
  view: View;
  date: Date;
  searchQuery: string;
  setView: (view: View) => void;
  setDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

const initialState = {
  view: 'timeGridWeek' as View,
  date: new Date(),
  searchQuery: '',
};

export const useCalendarStore = create<CalendarState>((set) => ({
  ...initialState,
  setView: (view) => set({ view }),
  setDate: (date) => set({ date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set(initialState),
}));
