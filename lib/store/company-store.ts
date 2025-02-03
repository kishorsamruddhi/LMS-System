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

export interface Company {
  id: string;
  name: string;
  type: 'business' | 'company' | 'other';
  industry: string;
  website: string;
  logo?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface CompanyState {
  companies: Company[];
  selectedCompanyId: string | null;
  selectedType: Company['type'];  // Add this line to define the type of selectedType
  isLoading: boolean;
  error: string | null;
  setCompanies: (companies: Company[]) => void;
  setSelectedCompanyId: (id: string | null) => void;
  setSelectedType: (type: Company['type']) => void;  // Add this function to set selectedType
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      selectedCompanyId: null,
      selectedType: 'company' as Company['type'],
      isLoading: false,
      error: null,

      setCompanies: (companies) => set({ companies }),
      
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      
      setSelectedType: (type: Company['type']) => set({ selectedType: type }),

      addCompany: async (company) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, 'companies'), {
            ...company,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newCompany = {
            ...company,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            companies: [...state.companies, newCompany],
            selectedCompanyId: docRef.id,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add company', isLoading: false });
        }
      },

      updateCompany: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const companyRef = doc(db, 'companies', id);
          await updateDoc(companyRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            companies: state.companies.map((company) =>
              company.id === id
                ? { ...company, ...updates, updatedAt: new Date().toISOString() }
                : company
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update company', isLoading: false });
        }
      },

      deleteCompany: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await deleteDoc(doc(db, 'companies', id));
          
          set((state) => ({
            companies: state.companies.filter((company) => company.id !== id),
            selectedCompanyId: state.selectedCompanyId === id ? null : state.selectedCompanyId,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete company', isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({ 
        companies: state.companies,
        selectedCompanyId: state.selectedCompanyId,
      }),
    }
  )
);