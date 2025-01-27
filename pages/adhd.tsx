"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Tag,
  Trash2,
  Edit,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO } from "date-fns";
import { useReminderStore, Reminder, ReminderFrequency } from "@/lib/store/reminder-store";

export default function ADHDPage() {
  const { reminders, categories, addReminder, updateReminder, deleteReminder, markComplete } = useReminderStore();
  const [isNewReminderOpen, setIsNewReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newReminder, setNewReminder] = useState<Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>>({
    title: "",
    description: "",
    frequency: "daily",
    interval: 1,
    lastCompleted: null,
    nextDue: new Date().toISOString(),
    isCompleted: false,
    category: "Personal Care",
  });

  const handleAddReminder = () => {
    try {
      addReminder(newReminder);
      setNewReminder({
        title: "",
        description: "",
        frequency: "daily",
        interval: 1,
        lastCompleted: null,
        nextDue: new Date().toISOString(),
        isCompleted: false,
        category: "Personal Care",
      });
      setIsNewReminderOpen(false);
      setNotification({ type: 'success', message: 'Reminder added successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add reminder' });
    }
  };

  const handleComplete = (id: string) => {
    try {
      markComplete(id);
      setNotification({ type: 'success', message: 'Reminder marked as complete' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to mark reminder as complete' });
    }
  };

  const getDueStatus = (nextDue: string) => {
    const dueDate = parseISO(nextDue);
    const now = new Date();
    
    if (isAfter(now, dueDate)) {
      return { color: "text-red-500", label: "Overdue" };
    }
    return { color: "text-green-500", label: "On Track" };
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ADHD Reminders</h1>
          <p className="text-sm text-muted-foreground">
            Never forget important self-care tasks
          </p>
        </div>
        <Button onClick={() => setIsNewReminderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => {
          const categoryReminders = reminders.filter((r) => r.category === category);
          if (categoryReminders.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryReminders.map((reminder) => {
                  const status = getDueStatus(reminder.nextDue);
                  
                  return (
                    <Card key={reminder.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{reminder.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedReminder(reminder)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteReminder(reminder.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {reminder.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            Every {reminder.interval} {reminder.frequency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={status.color}>{status.label}</span>
                        </div>
                        {reminder.lastCompleted && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Last done: {format(parseISO(reminder.lastCompleted), "MMM d")}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleComplete(reminder.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={isNewReminderOpen} onOpenChange={setIsNewReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="e.g., Take medication, Brush teeth"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder="Add any additional notes"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newReminder.category}
                  onValueChange={(value) => setNewReminder({ ...newReminder, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={newReminder.frequency}
                  onValueChange={(value: ReminderFrequency) =>
                    setNewReminder({ ...newReminder, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Repeat Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={newReminder.interval}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      interval: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-20"
                />
                <span className="text-muted-foreground">
                  {newReminder.frequency === "custom" ? "days" : newReminder.frequency}
                </span>
              </div>
            </div>
            <Button onClick={handleAddReminder} className="w-full">
              Add Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Reminder Dialog */}
      {selectedReminder && (
        <Dialog open={!!selectedReminder} onOpenChange={() => setSelectedReminder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedReminder.title}
                  onChange={(e) =>
                    setSelectedReminder({ ...selectedReminder, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedReminder.description}
                  onChange={(e) =>
                    setSelectedReminder({
                      ...selectedReminder,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedReminder.category}
                    onValueChange={(value) =>
                      setSelectedReminder({ ...selectedReminder, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={selectedReminder.frequency}
                    onValueChange={(value: ReminderFrequency) =>
                      setSelectedReminder({ ...selectedReminder, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Repeat Every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={selectedReminder.interval}
                    onChange={(e) =>
                      setSelectedReminder({
                        ...selectedReminder,
                        interval: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground">
                    {selectedReminder.frequency === "custom"
                      ? "days"
                      : selectedReminder.frequency}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  updateReminder(selectedReminder.id, selectedReminder);
                  setSelectedReminder(null);
                  setNotification({
                    type: 'success',
                    message: 'Reminder updated successfully',
                  });
                }}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}