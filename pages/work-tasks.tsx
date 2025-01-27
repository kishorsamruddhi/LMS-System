"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Grip, Calendar, CheckCircle2, Clock, AlertTriangle, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useWorkTaskStore, WorkTask } from "@/lib/store/work-task-store";
import { useMeetingStore, MeetingPlatform } from "@/lib/store/meeting-store";
import { useNotificationStore } from "@/lib/store/notification-store";

const priorityColors = {
  low: "border-blue-500",
  medium: "border-yellow-500",
  high: "border-red-500",
};

const priorityBg = {
  low: "bg-blue-500/10",
  medium: "bg-yellow-500/10",
  high: "bg-red-500/10",
};

export default function WorkTasksPage() {
  const { tasks, columns, columnOrder, addTask, moveTask } = useWorkTaskStore();
  const { addMeeting } = useMeetingStore(); // Move hook to component level
  const { generateTaskNotifications } = useNotificationStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newTask, setNewTask] = useState<Omit<WorkTask, "id">>({
    title: "",
    description: "",
    priority: "low" as "low" | "medium" | "high",
    deadline: format(new Date(), "yyyy-MM-dd"),
    completed: false,
    columnId: "pending",
  });
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    platform: "teams" as MeetingPlatform,
    link: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    attendees: [] as string[],
    createdBy: "",
  });

  const allTasks = Object.values(tasks);
  const completedTasks = allTasks.filter(task => task.columnId === "done").length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const urgentTasks = allTasks.filter(task => 
    task.priority === "high" && task.columnId !== "done"
  ).length;
  
  const inProgressTasks = allTasks.filter(task => 
    task.columnId === "processing"
  ).length;
  
  // Generate notifications for tasks
  useEffect(() => {
    generateTaskNotifications(allTasks);
  }, [allTasks, generateTaskNotifications]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
    setNotification({ type: 'success', message: 'Task moved successfully' });
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
    setIsDialogOpen(false);
    setNotification({ type: 'success', message: 'New task added successfully' });
  };

  const handleAddMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime) {
      setNotification({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    addMeeting({
      ...newMeeting,
      createdBy: "",
    });

    setNewMeeting({
      title: "",
      description: "",
      platform: "teams",
      link: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      attendees: [],
      createdBy: "",
    });
    setIsMeetingDialogOpen(false);
    setNotification({ type: 'success', message: 'Meeting scheduled successfully' });
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      {/* Notification */}
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Work Tasks</h1>
          <div className="text-sm text-muted-foreground">
            Track and manage your official work tasks
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Work Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Task description"
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
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Meeting title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              />
              <Textarea
                placeholder="Meeting description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              />
              <Select
                value={newMeeting.platform}
                onValueChange={(value: MeetingPlatform) =>
                  setNewMeeting({ ...newMeeting, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Meeting link"
                value={newMeeting.link}
                onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddMeeting} className="w-full">
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-full p-2 bg-blue-500/10">
            <CheckCircle2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{completionRate.toFixed(0)}%</h3>
              <Progress value={completionRate} className="w-20 h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-full p-2 bg-yellow-500/10">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{inProgressTasks}</h3>
              <span className="text-sm text-muted-foreground">tasks</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-full p-2 bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Urgent Tasks</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{urgentTasks}</h3>
              <span className="text-sm text-muted-foreground">high priority</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl font-bold">{completedTasks}/{totalTasks}</h3>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{completedTasks} completed out of {totalTasks} total tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Card>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.tasks.map((taskId) => tasks[taskId]);

            return (
              <div key={columnId}>
                <h2 className="font-semibold mb-2 sm:mb-4 text-base sm:text-lg">{column.title}</h2>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-secondary/30 rounded-lg p-2 sm:p-4 min-h-[150px] sm:min-h-[500px]"
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative mb-2 sm:mb-3 p-2 sm:p-4 bg-background border ${priorityColors[task.priority]} ${priorityBg[task.priority]} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 sm:before:w-2 before:${priorityColors[task.priority]} before:rounded-l-lg`}
                            >
                              <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-2 flex-1"
                                >
                                  <Grip className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                  <h3 className="font-medium text-sm sm:text-base truncate">{task.title}</h3>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground ml-2">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="hidden sm:inline">{format(new Date(task.deadline), "MMM d, yyyy")}</span>
                                  <span className="sm:hidden">{format(new Date(task.deadline), "MM/dd")}</span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}