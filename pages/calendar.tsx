"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  isAfter,
  isBefore,
  addDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoardStore, Task } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const priorityColors = {
  low: "bg-blue-500 hover:bg-blue-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  high: "bg-red-500 hover:bg-red-600",
};

const priorityBadgeVariants = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const { tasks, addTask, updateTask } = useBoardStore();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "low" as "low" | "medium" | "high",
    deadline: format(new Date(), "yyyy-MM-dd"),
    completed: false,
    columnId: "pending",
  });

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getTasksForDay = (day: Date) => {
    return Object.values(tasks).filter((task) =>
      isSameDay(parseISO(task.deadline), day)
    );
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextMonth = addDays(today, 30);
    
    return Object.values(tasks)
      .filter(task => {
        const deadline = parseISO(task.deadline);
        return isAfter(deadline, today) && isBefore(deadline, nextMonth);
      })
      .sort((a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime());
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped = tasks.reduce((acc, task) => {
      const date = format(parseISO(task.deadline), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  const toggleTaskCompletion = (task: Task) => {
    updateTask(task.id, {
      completed: !task.completed,
      columnId: !task.completed ? "done" : "pending",
    });
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    addTask(newTask);
    setNewTask({
      title: "",
      description: "",
      priority: "low",
      deadline: format(new Date(), "yyyy-MM-dd"),
      completed: false,
      columnId: "pending",
    });
    setIsNewTaskOpen(false);
  };

  const getStatusIcon = (task: Task) => {
    if (task.completed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (isAfter(new Date(), parseISO(task.deadline))) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-8 w-8"
              >

              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-8 w-8"
              >

              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                size="sm"
              >
                Today
              </Button>
              <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Event title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Event description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) =>
                        setNewTask({ ...newTask, deadline: e.target.value })
                      }
                    />
                    <Button onClick={handleAddTask} className="w-full">
                      Add Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 gap-px bg-border">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-background p-2 text-sm font-medium text-center border-b"
                >
                  {day}
                </div>
              ))}

              {days.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const today = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[100px] p-1 border-b border-r bg-background relative ${
                      !isCurrentMonth ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`text-sm p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                        today
                          ? "bg-primary text-primary-foreground font-bold"
                          : "font-medium"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <ScrollArea className="h-[60px]">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task);
                            setIsDetailsOpen(true);
                          }}
                          className={`${
                            task.completed
                              ? "bg-secondary hover:bg-secondary/80"
                              : priorityColors[task.priority]
                          } text-white text-xs p-1 mb-1 rounded cursor-pointer transition-colors flex items-center gap-1`}
                        >
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Upcoming Events Section */}
        <div className="lg:w-96">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <Card>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                {groupTasksByDate(getUpcomingTasks()).map(([date, tasks]) => (
                  <div key={date} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <h3 className="font-medium">
                        {isToday(new Date(date))
                          ? "Today"
                          : format(new Date(date), "EEEE, MMMM d")}
                      </h3>
                    </div>
                    <div className="space-y-2 pl-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsDetailsOpen(true);
                          }}
                        >
                          {getStatusIcon(task)}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">{task.title}</p>
                              <Badge variant="outline" className={priorityBadgeVariants[task.priority]}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-1">{selectedTask.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className={priorityBadgeVariants[selectedTask.priority]}>
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                  </Badge>
                  <span>Due: {format(parseISO(selectedTask.deadline), "MMM d, yyyy")}</span>
                </div>
              </div>
              <p className="text-sm">{selectedTask.description}</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant={selectedTask.completed ? "outline" : "default"}
                  onClick={() => toggleTaskCompletion(selectedTask)}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {selectedTask.completed ? "Mark Incomplete" : "Mark Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}