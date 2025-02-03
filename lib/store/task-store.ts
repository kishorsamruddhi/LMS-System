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
  query, 
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  tags: string[];
  projectId?: string;
  parentTaskId?: string;
  subtasks: SubTask[];
  assignedTo?: string[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id'>) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      setTasks: (tasks) => set({ tasks }),

      addTask: async (task) => {
        try {
          set({ isLoading: true, error: null });
          const docRef = await addDoc(collection(db, 'tasks'), {
            ...task,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          const newTask = {
            ...task,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add task', isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const taskRef = doc(db, 'tasks', id);
          await updateDoc(taskRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update task', isLoading: false });
        }
      },

      deleteTask: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await deleteDoc(doc(db, 'tasks', id));
          
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete task', isLoading: false });
        }
      },

      addSubtask: async (taskId, subtask) => {
        try {
          set({ isLoading: true, error: null });
          const newSubtask = { ...subtask, id: crypto.randomUUID() };
          
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) throw new Error('Task not found');

          const updatedSubtasks = [...task.subtasks, newSubtask];
          await get().updateTask(taskId, { subtasks: updatedSubtasks });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to add subtask', isLoading: false });
        }
      },

      updateSubtask: async (taskId, subtaskId, completed) => {
        try {
          set({ isLoading: true, error: null });
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) throw new Error('Task not found');

          const updatedSubtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed } : st
          );

          await get().updateTask(taskId, { subtasks: updatedSubtasks });
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update subtask', isLoading: false });
        }
      },

      deleteSubtask: async (taskId, subtaskId) => {
        try {
          set({ isLoading: true, error: null });
          const task = get().tasks.find((t) => t.id === taskId);
          if (!task) throw new Error('Task not found');

          const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
          await get().updateTask(taskId, { subtasks: updatedSubtasks });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to delete subtask', isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);