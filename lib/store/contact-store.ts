"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'telegram' | 'linkedin' | 'other';

export interface ContactDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod;
  otherContactMethods: {
    type: ContactMethod;
    value: string;
  }[];
  notes: string;
  documents: ContactDocument[];
  tags: string[];
  lastContact: string;
  nextFollowUp: string | null;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addDocument: (contactId: string, file: File) => Promise<void>;
  deleteDocument: (contactId: string, documentId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],
      isLoading: false,
      error: null,

      setContacts: (contacts) => set({ contacts }),

      addContact: async (contact) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, 'contacts'), {
            ...contact,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newContact = {
            ...contact,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            contacts: [...state.contacts, newContact],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add contact', isLoading: false });
        }
      },

      updateContact: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const contactRef = doc(db, 'contacts', id);
          await updateDoc(contactRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            contacts: state.contacts.map((contact) =>
              contact.id === id
                ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
                : contact
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update contact', isLoading: false });
        }
      },

      deleteContact: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          // Delete all documents first
          const contact = get().contacts.find(c => c.id === id);
          if (contact) {
            for (const doc of contact.documents) {
              const storageRef = ref(storage, `contacts/${id}/documents/${doc.id}`);
              await deleteObject(storageRef);
            }
          }
          
          await deleteDoc(doc(db, 'contacts', id));
          
          set((state) => ({
            contacts: state.contacts.filter((contact) => contact.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete contact', isLoading: false });
        }
      },

      addDocument: async (contactId, file) => {
        try {
          set({ isLoading: true, error: null });
          
          const documentId = crypto.randomUUID();
          const storageRef = ref(storage, `contacts/${contactId}/documents/${documentId}`);
          
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          
          const newDocument: ContactDocument = {
            id: documentId,
            name: file.name,
            type: file.type,
            url,
            uploadedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            contacts: state.contacts.map((contact) =>
              contact.id === contactId
                ? {
                    ...contact,
                    documents: [...contact.documents, newDocument],
                    updatedAt: new Date().toISOString(),
                  }
                : contact
            ),
            isLoading: false,
          }));
          
          // Update Firestore
          const contactRef = doc(db, 'contacts', contactId);
          await updateDoc(contactRef, {
            documents: get().contacts.find(c => c.id === contactId)?.documents,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          set({ error: 'Failed to upload document', isLoading: false });
        }
      },

      deleteDocument: async (contactId, documentId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Delete from storage
          const storageRef = ref(storage, `contacts/${contactId}/documents/${documentId}`);
          await deleteObject(storageRef);
          
          // Update state
          set((state) => ({
            contacts: state.contacts.map((contact) =>
              contact.id === contactId
                ? {
                    ...contact,
                    documents: contact.documents.filter(d => d.id !== documentId),
                    updatedAt: new Date().toISOString(),
                  }
                : contact
            ),
            isLoading: false,
          }));
          
          // Update Firestore
          const contactRef = doc(db, 'contacts', contactId);
          await updateDoc(contactRef, {
            documents: get().contacts.find(c => c.id === contactId)?.documents,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          set({ error: 'Failed to delete document', isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'contact-storage',
      partialize: (state) => ({ contacts: state.contacts }),
    }
  )
);