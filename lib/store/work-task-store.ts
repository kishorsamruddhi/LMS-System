import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  completed: boolean;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  tasks: string[]; // Array of task IDs
}

interface WorkTaskState {
  tasks: { [key: string]: WorkTask };
  columns: { [key: string]: Column };
  columnOrder: string[];
  addTask: (task: Omit<WorkTask, "id">) => void;
  updateTask: (id: string, updates: Partial<WorkTask>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceCol: string, destCol: string, newIndex: number) => void;
}

const initialState: Pick<WorkTaskState, 'tasks' | 'columns' | 'columnOrder'> = {
  tasks: {},
  columns: {
    pending: {
      id: "pending",
      title: "Pending",
      tasks: [],
    },
    processing: {
      id: "processing",
      title: "Processing",
      tasks: [],
    },
    done: {
      id: "done",
      title: "Done",
      tasks: [],
    },
  },
  columnOrder: ["pending", "processing", "done"],
};

export const useWorkTaskStore = create<WorkTaskState>()(
  persist(
    (set) => ({
      ...initialState,
      addTask: (task) => 
        set((state) => {
          const id = Date.now().toString();
          const newTask = { ...task, id };
          return {
            tasks: { ...state.tasks, [id]: newTask },
            columns: {
              ...state.columns,
              [task.columnId]: {
                ...state.columns[task.columnId],
                tasks: [...state.columns[task.columnId].tasks, id],
              },
            },
          };
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;

          const updatedTask = { ...task, ...updates };
          const newState = { ...state, tasks: { ...state.tasks, [id]: updatedTask } };

          if (updates.columnId && updates.columnId !== task.columnId) {
            const oldColumn = state.columns[task.columnId];
            const newColumn = state.columns[updates.columnId];

            newState.columns = {
              ...state.columns,
              [task.columnId]: {
                ...oldColumn,
                tasks: oldColumn.tasks.filter(taskId => taskId !== id),
              },
              [updates.columnId]: {
                ...newColumn,
                tasks: [...newColumn.tasks, id],
              },
            };
          }

          return newState;
        }),

      deleteTask: (id) =>
        set((state) => {
          const { [id]: deletedTask, ...remainingTasks } = state.tasks;
          if (!deletedTask) return state;

          return {
            tasks: remainingTasks,
            columns: {
              ...state.columns,
              [deletedTask.columnId]: {
                ...state.columns[deletedTask.columnId],
                tasks: state.columns[deletedTask.columnId].tasks.filter(
                  (taskId) => taskId !== id
                ),
              },
            },
          };
        }),

      moveTask: (taskId, sourceCol, destCol, newIndex) =>
        set((state) => {
          const sourceColumn = state.columns[sourceCol];
          const destColumn = state.columns[destCol];
          if (!sourceColumn || !destColumn) return state;

          const newSourceTasks = sourceColumn.tasks.filter((id) => id !== taskId);
          const newDestTasks = [...destColumn.tasks];
          newDestTasks.splice(newIndex, 0, taskId);

          return {
            ...state,
            columns: {
              ...state.columns,
              [sourceCol]: {
                ...sourceColumn,
                tasks: newSourceTasks,
              },
              [destCol]: {
                ...destColumn,
                tasks: newDestTasks,
              },
            },
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...state.tasks[taskId],
                columnId: destCol,
              },
            },
          };
        }),
    }),
    {
      name: 'work-task-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return {
          ...initialState,
          ...persistedState,
        };
      },
    }
  )
);