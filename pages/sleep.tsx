"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Moon,
  Sun,
  Plus,
  AlertCircle,
  Clock,
  Activity,
  Coffee,
  Wine,
  Zap,
} from "lucide-react";
import { format, parseISO, differenceInMinutes, addDays, subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  caffeine: boolean;
  alcohol: boolean;
  exercise: boolean;
  notes?: string;
}

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newEntry, setNewEntry] = useState<Omit<SleepEntry, 'id'>>({
    date: format(new Date(), "yyyy-MM-dd"),
    bedtime: "22:00",
    wakeTime: "06:00",
    quality: 'good',
    caffeine: false,
    alcohol: false,
    exercise: false,
  });

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('sleepEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('sleepEntries', JSON.stringify(entries));
  }, [entries]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const calculateSleepDuration = (bedtime: string, wakeTime: string) => {
    const bedDate = parseISO(`2000-01-01T${bedtime}`);
    let wakeDate = parseISO(`2000-01-01T${wakeTime}`);
    
    // If wake time is earlier than bedtime, it's the next day
    if (wakeDate < bedDate) {
      wakeDate = addDays(wakeDate, 1);
    }
    
    return differenceInMinutes(wakeDate, bedDate) / 60;
  };

  const handleAddEntry = () => {
    const entry: SleepEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
    };

    setEntries([...entries, entry]);
    setNewEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      bedtime: "22:00",
      wakeTime: "06:00",
      quality: 'good',
      caffeine: false,
      alcohol: false,
      exercise: false,
    });
    setIsDialogOpen(false);
    setNotification({ type: 'success', message: 'Sleep entry added successfully' });
  };

  // Calculate average sleep duration for the last 7 days
  const calculateAverageSleep = () => {
    const last7Days = entries
      .slice(-7)
      .map(entry => calculateSleepDuration(entry.bedtime, entry.wakeTime));
    
    if (last7Days.length === 0) return 0;
    return last7Days.reduce((sum, duration) => sum + duration, 0) / last7Days.length;
  };

  // Prepare chart data
  const chartData = Array.from({ length: 14 }).map((_, index) => {
    const date = format(subDays(new Date(), 13 - index), "yyyy-MM-dd");
    const entry = entries.find(e => e.date === date);
    
    return {
      date,
      hours: entry ? calculateSleepDuration(entry.bedtime, entry.wakeTime) : null,
      quality: entry?.quality,
    };
  });

  const qualityColors = {
    poor: "#ef4444",
    fair: "#f59e0b",
    good: "#10b981",
    excellent: "#3b82f6",
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Moon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sleep Tracker</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sleep Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sleep Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bedtime</Label>
                  <Input
                    type="time"
                    value={newEntry.bedtime}
                    onChange={(e) => setNewEntry({ ...newEntry, bedtime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wake Time</Label>
                  <Input
                    type="time"
                    value={newEntry.wakeTime}
                    onChange={(e) => setNewEntry({ ...newEntry, wakeTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <Select
                  value={newEntry.quality}
                  onValueChange={(value: SleepEntry['quality']) =>
                    setNewEntry({ ...newEntry, quality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Factors</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={newEntry.caffeine ? "default" : "outline"}
                    onClick={() => setNewEntry({ ...newEntry, caffeine: !newEntry.caffeine })}
                    className="w-full"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Caffeine
                  </Button>
                  <Button
                    variant={newEntry.alcohol ? "default" : "outline"}
                    onClick={() => setNewEntry({ ...newEntry, alcohol: !newEntry.alcohol })}
                    className="w-full"
                  >
                    <Wine className="h-4 w-4 mr-2" />
                    Alcohol
                  </Button>
                  <Button
                    variant={newEntry.exercise ? "default" : "outline"}
                    onClick={() => setNewEntry({ ...newEntry, exercise: !newEntry.exercise })}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Exercise
                  </Button>
                </div>
              </div>
              <Button onClick={handleAddEntry} className="w-full">
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold">Average Sleep</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last 7 Days</span>
              <span className="text-muted-foreground">
                {calculateAverageSleep().toFixed(1)} hours
              </span>
            </div>
            <Progress
              value={(calculateAverageSleep() / 9) * 100}
              className="h-2"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold">Bedtime Consistency</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last Week</span>
              <span className="text-muted-foreground">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold">Sleep Quality</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last Week</span>
              <span className="text-muted-foreground">Good</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Sleep Chart */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sleep Duration & Quality</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(parseISO(date), "MMM d")}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                domain={[0, 12]}
                ticks={[0, 2, 4, 6, 8, 10, 12]}
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background p-2 rounded-lg border shadow-lg">
                      <p className="font-medium">{format(parseISO(data.date), "MMM d, yyyy")}</p>
                      {data.hours && (
                        <p className="text-sm">Duration: {data.hours.toFixed(1)} hours</p>
                      )}
                      {data.quality && (
                        <p className="text-sm capitalize">Quality: {data.quality}</p>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Sleep Entries</h2>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Quality</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Factors</th>
              </tr>
            </thead>
            <tbody>
              {entries
                .slice()
                .reverse()
                .slice(0, 7)
                .map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-4 align-middle">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 align-middle">
                      {calculateSleepDuration(entry.bedtime, entry.wakeTime).toFixed(1)} hours
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          entry.quality === 'excellent' ? 'bg-blue-500/10 text-blue-500' :
                          entry.quality === 'good' ? 'bg-green-500/10 text-green-500' :
                          entry.quality === 'fair' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {entry.quality.charAt(0).toUpperCase() + entry.quality.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        {entry.caffeine && (
                          <Coffee className="h-4 w-4 text-muted-foreground" />
                        )}
                        {entry.alcohol && (
                          <Wine className="h-4 w-4 text-muted-foreground" />
                        )}
                        {entry.exercise && (
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}