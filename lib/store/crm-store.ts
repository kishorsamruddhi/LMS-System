"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
export type LeadSource = 'website' | 'referral' | 'linkedin' | 'cold-email' | 'conference' | 'other';
export type LeadPriority = 'low' | 'medium' | 'high';

export interface Lead {
  id: string;
  companyId: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  value: number;
  notes: string;
  lastContact: any;
  nextFollowUp: string | null;
  tags: string[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

interface CRMState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      leads: [],
      isLoading: false,
      error: null,

      setLeads: (leads) => set({ leads }),

      addLead: async (lead) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, `companies/${lead.companyId}/leads`), {
            ...lead,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newLead = {
            ...lead,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            leads: [...state.leads, newLead],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add lead', isLoading: false });
        }
      },

      updateLead: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const companyId = get().leads.find(lead => lead.id === id)?.companyId;
          if (!companyId) throw new Error('Company ID not found');
          
          const leadRef = doc(db, `companies/${companyId}/leads`, id);
          await updateDoc(leadRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            leads: state.leads.map((lead) =>
              lead.id === id
                ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
                : lead
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update lead', isLoading: false });
        }
      },

      deleteLead: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const companyId = get().leads.find(lead => lead.id === id)?.companyId;
          if (!companyId) throw new Error('Company ID not found');
          
          await deleteDoc(doc(db, `companies/${companyId}/leads`, id));
          
          set((state) => ({
            leads: state.leads.filter((lead) => lead.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete lead', isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'crm-storage',
      partialize: (state) => ({ leads: state.leads }),
    }
  )
);