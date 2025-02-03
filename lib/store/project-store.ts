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

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  workflowStates: {
    id: string;
    name: string;
    color: string;
    order: number;
  }[];
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addWorkflowState: (projectId: string, state: Omit<Project['workflowStates'][0], 'id'>) => Promise<void>;
  updateWorkflowState: (projectId: string, stateId: string, updates: Partial<Project['workflowStates'][0]>) => Promise<void>;
  deleteWorkflowState: (projectId: string, stateId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,

      setProjects: (projects) => set({ projects }),

      addProject: async (project) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, 'projects'), {
            ...project,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newProject = {
            ...project,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            projects: [...state.projects, newProject],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add project', isLoading: false });
        }
      },

      updateProject: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const projectRef = doc(db, 'projects', id);
          await updateDoc(projectRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? { ...project, ...updates, updatedAt: new Date().toISOString() }
                : project
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update project', isLoading: false });
        }
      },

      deleteProject: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await deleteDoc(doc(db, 'projects', id));
          
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete project', isLoading: false });
        }
      },

      addWorkflowState: async (projectId, state) => {
        try {
          set({ isLoading: true, error: null });
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) throw new Error('Project not found');

          const newState = { ...state, id: crypto.randomUUID() };
          const updatedStates = [...project.workflowStates, newState];
          
          await get().updateProject(projectId, { workflowStates: updatedStates });
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to add workflow state', isLoading: false });
        }
      },

      updateWorkflowState: async (projectId, stateId, updates) => {
        try {
          set({ isLoading: true, error: null });
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) throw new Error('Project not found');

          const updatedStates = project.workflowStates.map((state) =>
            state.id === stateId ? { ...state, ...updates } : state
          );

          await get().updateProject(projectId, { workflowStates: updatedStates });
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update workflow state', isLoading: false });
        }
      },

      deleteWorkflowState: async (projectId, stateId) => {
        try {
          set({ isLoading: true, error: null });
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) throw new Error('Project not found');

          const updatedStates = project.workflowStates.filter((state) => state.id !== stateId);
          await get().updateProject(projectId, { workflowStates: updatedStates });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to delete workflow state', isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);