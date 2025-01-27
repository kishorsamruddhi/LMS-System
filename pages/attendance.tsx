"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, Edit2, Trash2, Calendar } from "lucide-react";
import { useLeaveStore, LeaveType } from "@/lib/store/leave-store";
import { format, differenceInDays, parseISO } from "date-fns";

const defaultQuotas = [
  { type: 'Casual Leave', total: 12, used: 0, remaining: 12, entries: [] },
  { type: 'Earned Leave', total: 30, used: 0, remaining: 30, entries: [] },
  { type: 'Medical Leave', total: 10, used: 0, remaining: 10, entries: [] },
  { type: 'CPL', total: 8, used: 0, remaining: 8, entries: [] },
  { type: 'RH', total: 2, used: 0, remaining: 2, entries: [] },
];

export default function AttendancePage() {
  const { quotas = defaultQuotas, updateQuota, addLeaveEntry, deleteLeaveEntry } = useLeaveStore();
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [newQuota, setNewQuota] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [leaveToAdd, setLeaveToAdd] = useState({
    type: "" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Get all leave entries across all types
  const allLeaveEntries = quotas.flatMap(quota => 
    quota.entries.map(entry => ({
      ...entry,
      leaveType: quota.type
    }))
  ).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleQuotaUpdate = () => {
    if (selectedLeaveType && newQuota) {
      updateQuota(selectedLeaveType, parseInt(newQuota, 10));
      setSelectedLeaveType(null);
      setNewQuota("");
      setIsSettingsOpen(false);
    }
  };

  const handleAddLeave = () => {
    if (leaveToAdd.type && leaveToAdd.startDate && leaveToAdd.endDate) {
      const start = parseISO(leaveToAdd.startDate);
      const end = parseISO(leaveToAdd.endDate);
      const days = differenceInDays(end, start) + 1;

      if (days > 0) {
        addLeaveEntry({
          type: leaveToAdd.type,
          startDate: leaveToAdd.startDate,
          endDate: leaveToAdd.endDate,
          days,
          reason: leaveToAdd.reason.trim() || "Not specified",
        });

        setLeaveToAdd({
          type: "" as LeaveType,
          startDate: "",
          endDate: "",
          reason: "",
        });
        setIsAddLeaveOpen(false);
      }
    }
  };

  const handleDeleteEntry = (type: LeaveType, entryId: string) => {
    deleteLeaveEntry(type, entryId);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Leave Tracker</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isAddLeaveOpen} onOpenChange={setIsAddLeaveOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="mr-2 h-4 w-4" />
                Add Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Leave Entry</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Leave Type</Label>
                  <Select
                    value={leaveToAdd.type}
                    onValueChange={(value: LeaveType) =>
                      setLeaveToAdd({ ...leaveToAdd, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotas.map((quota) => (
                        <SelectItem key={quota.type} value={quota.type}>
                          {quota.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={leaveToAdd.startDate}
                    onChange={(e) => setLeaveToAdd({ ...leaveToAdd, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={leaveToAdd.endDate}
                    onChange={(e) => setLeaveToAdd({ ...leaveToAdd, endDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Reason (Optional)</Label>
                  <Textarea
                    value={leaveToAdd.reason}
                    onChange={(e) => setLeaveToAdd({ ...leaveToAdd, reason: e.target.value })}
                    placeholder="Enter reason for leave"
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={handleAddLeave}>Add Leave</Button>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Total Leave Days</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Leave Type</Label>
                  <Select
                    value={selectedLeaveType || ""}
                    onValueChange={(value: LeaveType) => setSelectedLeaveType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {quotas.map((quota) => (
                        <SelectItem key={quota.type} value={quota.type}>
                          {quota.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Total Days</Label>
                  <Input
                    type="number"
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    placeholder="Enter total days"
                    min="0"
                  />
                </div>
              </div>
              <Button onClick={handleQuotaUpdate}>Update Total</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quotas.map((quota) => (
          <Card key={quota.type} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{quota.type}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {quota.remaining} days remaining
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                  
                    setNewQuota(quota.total.toString());
                    setIsSettingsOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress
              value={(quota.used / quota.total) * 100}
              className="h-2 mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>{quota.used} used</span>
              <span>{quota.total} total</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Leave History Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Leave History</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLeaveEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.leaveType}</TableCell>
                  <TableCell>{format(parseISO(entry.startDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(parseISO(entry.endDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{entry.days}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{entry.reason}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.leaveType as LeaveType, entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {allLeaveEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No leave entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}