"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeaveType = 'Casual Leave' | 'Earned Leave' | 'Medical Leave' | 'CPL' | 'RH';

export interface LeaveEntry {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

export interface LeaveQuota {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
  entries: LeaveEntry[];
}

interface LeaveState {
  quotas: LeaveQuota[];
  updateQuota: (type: LeaveType, total: number) => void;
  addLeaveEntry: (entry: Omit<LeaveEntry, 'id'>) => void;
  deleteLeaveEntry: (type: LeaveType, entryId: string) => void;
}

const defaultQuotas: LeaveQuota[] = [
  { type: 'Casual Leave', total: 12, used: 0, remaining: 12, entries: [] },
  { type: 'Earned Leave', total: 30, used: 0, remaining: 30, entries: [] },
  { type: 'Medical Leave', total: 10, used: 0, remaining: 10, entries: [] },
  { type: 'CPL', total: 8, used: 0, remaining: 8, entries: [] },
  { type: 'RH', total: 2, used: 0, remaining: 2, entries: [] },
];

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      quotas: defaultQuotas,

      updateQuota: (type, total) => {
        set((state) => ({
          quotas: state.quotas.map(quota => {
            if (quota.type === type) {
              const used = quota.entries.reduce((sum, entry) => sum + entry.days, 0);
              return {
                ...quota,
                total,
                used,
                remaining: total - used,
              };
            }
            return quota;
          }),
        }));
      },

      addLeaveEntry: (entry) => {
        set((state) => ({
          quotas: state.quotas.map(quota => {
            if (quota.type === entry.type) {
              const newEntry = { ...entry, id: crypto.randomUUID() };
              const newEntries = [...(quota.entries || []), newEntry];
              const totalUsed = newEntries.reduce((sum, e) => sum + e.days, 0);
              
              return {
                ...quota,
                entries: newEntries,
                used: totalUsed,
                remaining: quota.total - totalUsed,
              };
            }
            return quota;
          }),
        }));
      },

      deleteLeaveEntry: (type, entryId) => {
        set((state) => ({
          quotas: state.quotas.map(quota => {
            if (quota.type === type) {
              const newEntries = quota.entries.filter(entry => entry.id !== entryId);
              const totalUsed = newEntries.reduce((sum, entry) => sum + entry.days, 0);
              
              return {
                ...quota,
                entries: newEntries,
                used: totalUsed,
                remaining: quota.total - totalUsed,
              };
            }
            return quota;
          }),
        }));
      },
    }),
    {
      name: 'leave-storage',
      version: 1,
    }
  )
);