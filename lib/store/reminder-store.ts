"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  frequency: ReminderFrequency;
  interval: number; // Days between reminders
  lastCompleted: string | null;
  nextDue: string;
  isCompleted: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ReminderState {
  reminders: Reminder[];
  categories: string[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  markComplete: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      categories: ['Personal Care', 'Medication', 'Household', 'Other'],

      addReminder: (reminder) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        set((state) => ({
          reminders: [
            ...state.reminders,
            {
              ...reminder,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id
              ? {
                  ...reminder,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : reminder
          ),
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }));
      },

      markComplete: (id) => {
        const reminder = get().reminders.find((r) => r.id === id);
        if (!reminder) return;

        const now = new Date();
        let nextDue = new Date(now);

        // Calculate next due date based on frequency and interval
        switch (reminder.frequency) {
          case 'daily':
            nextDue.setDate(nextDue.getDate() + reminder.interval);
            break;
          case 'weekly':
            nextDue.setDate(nextDue.getDate() + (reminder.interval * 7));
            break;
          case 'monthly':
            nextDue.setMonth(nextDue.getMonth() + reminder.interval);
            break;
          case 'custom':
            nextDue.setDate(nextDue.getDate() + reminder.interval);
            break;
        }

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id
              ? {
                  ...r,
                  lastCompleted: now.toISOString(),
                  nextDue: nextDue.toISOString(),
                  updatedAt: now.toISOString(),
                }
              : r
          ),
        }));
      },

      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, category],
        }));
      },

      deleteCategory: (category) => {
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
        }));
      },
    }),
    {
      name: 'reminder-storage',
    }
  )
);