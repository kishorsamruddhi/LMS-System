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

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  isFavorite: boolean;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

interface NoteState {
  notes: Note[];
  folders: string[];
  isLoading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addFolder: (folder: string) => void;
  deleteFolder: (folder: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: ['Personal', 'Work', 'Ideas'],
      isLoading: false,
      error: null,

      setNotes: (notes) => set({ notes }),

      addNote: async (note) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, 'notes'), {
            ...note,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newNote = {
            ...note,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            notes: [...state.notes, newNote],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add note', isLoading: false });
        }
      },

      updateNote: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const noteRef = doc(db, 'notes', id);
          await updateDoc(noteRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id
                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                : note
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update note', isLoading: false });
        }
      },

      deleteNote: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await deleteDoc(doc(db, 'notes', id));
          
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete note', isLoading: false });
        }
      },

      addFolder: (folder) => {
        set((state) => ({
          folders: [...state.folders, folder],
        }));
      },

      deleteFolder: (folder) => {
        set((state) => ({
          folders: state.folders.filter((f) => f !== folder),
        }));
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'note-storage',
      partialize: (state) => ({ notes: state.notes, folders: state.folders }),
    }
  )
);