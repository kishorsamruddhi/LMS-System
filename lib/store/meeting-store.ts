import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MeetingPlatform = 'zoom' | 'teams' | 'meet' | 'other';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  platform: MeetingPlatform;
  link?: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  createdBy: string;
}

interface MeetingState {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set) => ({
      meetings: [],

      addMeeting: (meeting) => 
        set((state) => ({
          meetings: [...state.meetings, { ...meeting, id: crypto.randomUUID() }],
        })),

      updateMeeting: (id, updates) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === id ? { ...meeting, ...updates } : meeting
          ),
        })),

      deleteMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((meeting) => meeting.id !== id),
        })),
    }),
    {
      name: 'meeting-storage',
      version: 1,
    }
  )
);