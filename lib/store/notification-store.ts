"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, parseISO } from 'date-fns';
import { Task } from '@/lib/store';

export interface TaskNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: 'today' | 'tomorrow' | 'upcoming' | 'overdue';
  deadline: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: TaskNotification[];
  addNotification: (notification: Omit<TaskNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  generateTaskNotifications: (tasks: Task[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = crypto.randomUUID();
        set((state) => ({
          notifications: [
            {
              ...notification,
              id,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        }));
      },

      generateTaskNotifications: (tasks) => {
        const today = new Date();
        const existingNotifications = get().notifications;
        const newNotifications: TaskNotification[] = [];

        tasks.forEach((task) => {
          if (task.columnId === 'done') return;

          const deadline = parseISO(task.deadline);
          const daysUntilDeadline = differenceInDays(deadline, today);

          // Check if notification already exists for this task and timeframe
          const hasNotification = existingNotifications.some(
            (n) => n.taskId === task.id && n.type === getNotificationType(daysUntilDeadline)
          );

          if (!hasNotification) {
            if (daysUntilDeadline === 0) {
              newNotifications.push({
                taskId: task.id,
                title: 'Task Due Today',
                message: `"${task.title}" is due today!`,
                type: 'today',
                deadline: task.deadline,
                read: false,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
              });
            } else if (daysUntilDeadline === 1) {
              newNotifications.push({
                taskId: task.id,
                title: 'Task Due Tomorrow',
                message: `"${task.title}" is due tomorrow!`,
                type: 'tomorrow',
                deadline: task.deadline,
                read: false,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
              });
            } else if (daysUntilDeadline === 2) {
              newNotifications.push({
                taskId: task.id,
                title: 'Upcoming Task',
                message: `"${task.title}" is due in 2 days!`,
                type: 'upcoming',
                deadline: task.deadline,
                read: false,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
              });
            } else if (daysUntilDeadline === 7) {
              newNotifications.push({
                taskId: task.id,
                title: 'Upcoming Task',
                message: `"${task.title}" is due in a week!`,
                type: 'upcoming',
                deadline: task.deadline,
                read: false,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
              });
            } else if (daysUntilDeadline < 0) {
              newNotifications.push({
                taskId: task.id,
                title: 'Overdue Task',
                message: `"${task.title}" is overdue!`,
                type: 'overdue',
                deadline: task.deadline,
                read: false,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
              });
            }
          }
        });

        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [...newNotifications, ...state.notifications],
          }));
        }
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);

function getNotificationType(daysUntilDeadline: number): TaskNotification['type'] {
  if (daysUntilDeadline < 0) return 'overdue';
  if (daysUntilDeadline === 0) return 'today';
  if (daysUntilDeadline === 1) return 'tomorrow';
  return 'upcoming';
}