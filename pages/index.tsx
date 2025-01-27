"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trophy,
  Medal,
  Target,

  Clock,
  Moon,
  Sun,
  Activity,
  CheckCircle2,
  Bell,
  AlertTriangle,
  UtensilsCrossed,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { useLeaveStore } from "@/lib/store/leave-store";
import { SupplementTracker } from "@/components/supplement-tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReminderStore } from "@/lib/store/reminder-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBoardStore } from "@/lib/store";
import { format, isToday, parseISO, isAfter } from "date-fns";
import { useCRMStore } from "@/lib/store/crm-store";
import { useMeetingStore } from "@/lib/store/meeting-store";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,

  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const leaderboardData = [
  { id: 1, name: "Sarah Chen", score: 98, streak: 45 },
  { id: 2, name: "Mike Johnson", score: 95, streak: 42 },
  { id: 3, name: "Alex Kim", score: 92, streak: 38 },
  { id: 4, name: "Emma Davis", score: 88, streak: 35 },
  { id: 5, name: "James Wilson", score: 85, streak: 30 },
];

const chartData = [
  { date: "2024-02-01", sarah: 95, mike: 82, alex: 78, emma: 65, james: 60 },
  { date: "2024-02-02", sarah: 92, mike: 85, alex: 75, emma: 68, james: 63 },
  { date: "2024-02-03", sarah: 98, mike: 88, alex: 82, emma: 72, james: 65 },
  { date: "2024-02-04", sarah: 96, mike: 86, alex: 80, emma: 70, james: 68 },
  { date: "2024-02-05", sarah: 100, mike: 90, alex: 85, emma: 75, james: 70 },
  { date: "2024-02-06", sarah: 97, mike: 89, alex: 83, emma: 73, james: 69 },
  { date: "2024-02-07", sarah: 99, mike: 91, alex: 86, emma: 76, james: 72 },
  { date: "2024-02-08", sarah: 100, mike: 93, alex: 88, emma: 78, james: 75 },
  { date: "2024-02-09", sarah: 98, mike: 90, alex: 85, emma: 77, james: 73 },
  { date: "2024-02-10", sarah: 96, mike: 88, alex: 83, emma: 75, james: 70 },
  { date: "2024-02-11", sarah: 95, mike: 87, alex: 82, emma: 74, james: 69 },
  { date: "2024-02-12", sarah: 97, mike: 89, alex: 84, emma: 76, james: 71 },
  { date: "2024-02-13", sarah: 99, mike: 92, alex: 87, emma: 79, james: 74 },
  { date: "2024-02-14", sarah: 100, mike: 94, alex: 89, emma: 81, james: 76 },
];

const chartConfig = {
  sarah: {
    label: "Sarah Chen",
    color: "hsl(152, 76%, 36%)", // Green
  },
  mike: {
    label: "Mike Johnson",
    color: "hsl(201, 96%, 32%)", 
  },
  alex: {
    label: "Alex Kim",
    color: "hsl(262, 60%, 45%)", 
  },
  emma: {
    label: "Emma Davis",
    color: "hsl(321, 70%, 49%)", 
  },
  james: {
    label: "James Wilson",
    color: "hsl(48, 96%, 53%)", 
  },
} satisfies ChartConfig;

const ProgressChart = () => {
  const [timeRange, setTimeRange] = useState("14d");

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Habit Progress</h2>
          <p className="text-sm text-muted-foreground">Daily habit completion percentage</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="14d">Last 14 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] mt-4">
        <AreaChart data={chartData}>
          <defs>
            {Object.entries(chartConfig).map(([key, config]) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} className="stroke-muted/30" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => format(new Date(value), "MMM d")}
            className="text-xs text-muted-foreground"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {Object.keys(chartConfig).map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={chartConfig[key as keyof typeof chartConfig].color}
              fill={`url(#gradient-${key})`}
              strokeWidth={2}
            />
          ))}
    
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export default function WorkstationPage() {
  const router = useRouter();
  const { quotas = [] } = useLeaveStore();
  const { leads } = useCRMStore();
  const { meetings } = useMeetingStore();
  const { reminders } = useReminderStore();
  const { tasks } = useBoardStore();
  const [quote, setQuote] = useState<{ q: string; a: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [weightEntries, setWeightEntries] = useState<{ weight: number; height: number; }[]>([]);

  const calculateBMI = (weight: number, height: number) => {
    // Height should be in meters, weight in kg
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { category: "Normal", color: "text-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
    return { category: "Obese", color: "text-red-500" };
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchQuote = useCallback(async () => {
    try {
      // Use a fallback quote since the API is unreliable
      setQuote({
        q: 'The only way to do great work is to love what you do.',
        a: "Steve Jobs"
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote({
        q: 'The only way to do great work is to love what you do.',
        a: "Steve Jobs"
      });
    }
  }, []);

  useEffect(() => {
    fetchQuote();
    // Refresh quote every 24 hours
    const interval = setInterval(fetchQuote, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchQuote]);

  // Load weight entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('weightEntries') || '[]');
    setWeightEntries(savedEntries);
  }, []);

  // Calculate leave statistics
  const totalLeaves = quotas.reduce((sum, quota) => sum + quota.total, 0);
  const usedLeaves = quotas.reduce((sum, quota) => sum + quota.used, 0);
  const leavePercentage = (usedLeaves / totalLeaves) * 100;

  // Calculate task statistics
  const allTasks = Object.values(tasks);
  const pendingTasks = allTasks.filter(task => 
    task.columnId === "pending" && 
    isToday(parseISO(task.deadline))
  );
  const urgentTasks = allTasks.filter(task => 
    task.priority === "high" && 
    task.columnId !== "done"
  );

  const [todaysMeals, setTodaysMeals] = useState({
    breakfast: { calories: "", notes: "" },
    lunch: { calories: "", notes: "" },
    dinner: { calories: "", notes: "" },
    snacks: { calories: "", notes: "" },
  });
  const [selectedMeal, setSelectedMeal] = useState<{
    type: keyof typeof todaysMeals;
    name: string;
  } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load today's meals from localStorage
  useEffect(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const savedMeals = JSON.parse(localStorage.getItem('meals') || '{}');
    const meals = savedMeals[todayStr] || {
      breakfast: { calories: "", notes: "" },
      lunch: { calories: "", notes: "" },
      dinner: { calories: "", notes: "" },
      snacks: { calories: "", notes: "" },
    };
    setTodaysMeals(meals);
  }, []);

  const getMealStatus = (meal: { calories: string; notes: string }) => {
    if (meal.calories || meal.notes) {
      return {
        tracked: true,
        calories: meal.calories ? `${meal.calories} cal` : 'No calories',
        notes: meal.notes || 'No notes'
      };
    }
    return { tracked: false };
  };

  const handleSaveMeal = () => {
    if (!selectedMeal) return;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const savedMeals = JSON.parse(localStorage.getItem('meals') || '{}');
    
    savedMeals[todayStr] = {
      ...todaysMeals,
    };
    
    localStorage.setItem('meals', JSON.stringify(savedMeals));
    setNotification({ type: 'success', message: `${selectedMeal.name} updated successfully` });
    setSelectedMeal(null);
  };

  const handleCaloriesChange = (value: string) => {
    if (!selectedMeal) return;
    // Only allow positive numbers
    if (value && !/^\d+$/.test(value)) return;
    
    setTodaysMeals(prev => ({
      ...prev,
      [selectedMeal.type]: {
        ...prev[selectedMeal.type],
        calories: value
      }
    }));
  };

  const handleNotesChange = (value: string) => {
    if (!selectedMeal) return;
    setTodaysMeals(prev => ({
      ...prev,
      [selectedMeal.type]: {
        ...prev[selectedMeal.type],
        notes: value
      }
    }));
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || 'User'}!</h1>
          {quote && (
           <p>&quot;Unescaped quote&quot;</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Today's Important Tasks */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Todays Important Tasks</h2>
              <span className="text-sm text-muted-foreground">
                {pendingTasks.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No important tasks for today
                </p>
              ) : (
                pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {task.priority === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/todo")}>
                      View
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Today's Meetings */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Todays Meetings</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/work-tasks")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {meetings
                .filter(meeting => meeting.date === format(new Date(), "yyyy-MM-dd"))
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">

                        <span className="font-medium">{meeting.title}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6 text-sm text-muted-foreground">
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                        <span>•</span>
                        <span className="capitalize">{meeting.platform}</span>
                      </div>
                    </div>
                    {meeting.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(meeting.link, '_blank')}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              {meetings.filter(meeting => meeting.date === format(new Date(), "yyyy-MM-dd")).length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No meetings scheduled for today
                </p>
              )}
            </div>
          </Card>

          {/* Follow-up Dates */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Follow-ups</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/crm")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {leads?.filter(lead => lead.nextFollowUp && isAfter(parseISO(lead.nextFollowUp), new Date()))
                .sort((a, b) => parseISO(a.nextFollowUp!).getTime() - parseISO(b.nextFollowUp!).getTime())
                .slice(0, 3)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
        
                        <span className="font-medium">{lead.companyName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {format(parseISO(lead.nextFollowUp!), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/crm")}>
                      View
                    </Button>
                  </div>
                ))}
              {(!leads || leads.filter(lead => lead.nextFollowUp).length === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming follow-ups
                </p>
              )}
            </div>
          </Card>

          {/* Upcoming Lifestyle Responsibilities */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Lifestyle Responsibilities</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/adhd")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming reminders
                </p>
              ) : (
                reminders.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isAfter(new Date(), parseISO(reminder.nextDue))
                          ? "bg-red-500/10"
                          : "bg-green-500/10"
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          isAfter(new Date(), parseISO(reminder.nextDue))
                            ? "text-red-500"
                            : "text-green-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(parseISO(reminder.nextDue), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/adhd")}>
                      View
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Leave Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Leave Summary</h2>
                <p className="text-sm text-muted-foreground">
                  {totalLeaves - usedLeaves} days remaining of {totalLeaves} total days
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/attendance")}>
                View Details
              </Button>
            </div>
            <div className="space-y-4">
              {quotas.slice(0, 3).map((quota) => (
                <div key={quota.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{quota.type}</span>
                    <span className="text-muted-foreground">
                      {quota.used}/{quota.total}
                    </span>
                  </div>
                  <Progress value={(quota.used / quota.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* BMI Status */}
          <Card className="p-4">
            {weightEntries?.length > 0 && weightEntries[weightEntries.length - 1].height ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current BMI</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {calculateBMI(
                        weightEntries[weightEntries.length - 1].weight,
                        weightEntries[weightEntries.length - 1].height
                      ).toFixed(1)}
                    </span>
                    <span className={`text-sm ${
                      getBMICategory(calculateBMI(
                        weightEntries[weightEntries.length - 1].weight,
                        weightEntries[weightEntries.length - 1].height
                      )).color
                    }`}>
                      ({getBMICategory(calculateBMI(
                        weightEntries[weightEntries.length - 1].weight,
                        weightEntries[weightEntries.length - 1].height
                      )).category})
                    </span>
                  </div>
                </div>
                <Progress
                  value={
                    (calculateBMI(
                      weightEntries[weightEntries.length - 1].weight,
                      weightEntries[weightEntries.length - 1].height
                    ) / 40) * 100
                  }
                  className="h-2 relative overflow-hidden bg-black/20 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:via-green-500  [&>div]:to-red-500"
                />
                <div className="grid grid-cols-4 text-xs text-muted-foreground">
                  <div>Underweight<br/>&lt;18.5</div>
                  <div>Normal<br/>18.5-24.9</div>
                  <div>Overweight<br/>25-29.9</div>
                  <div>Obese<br/>&gt;30</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Add weight and height in Health section to see BMI status</p>
            )}
          </Card>

          {/* Sleep Stats */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Sleep Overview</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/sleep")}>
                View Details
              </Button>
            </div>
            <div className="space-y-4">
              {/* Sleep Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Night</span>
                  <span className="text-muted-foreground">7.5 hours</span>
                </div>
                <Progress 
                  value={75} 
                  className="h-2 relative overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:via-blue-500 [&>div]:to-cyan-500" 
                />
                <div className="grid grid-cols-3 text-xs text-muted-foreground">
                  <div>Poor<br/>&lt;6h</div>
                  <div className="text-center">Good<br/>7-8h</div>
                  <div className="text-right">Excellent<br/>&gt;8h</div>
                </div>
              </div>

              {/* Sleep Quality Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Clock className="h-4 w-4 text-indigo-500 mx-auto" />
                  </div>
                  <p className="text-xs font-medium">10:30 PM</p>
                  <p className="text-[10px] text-muted-foreground">Bedtime</p>
                </div>
                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Sun className="h-4 w-4 text-blue-500 mx-auto" />
                  </div>
                  <p className="text-xs font-medium">6:00 AM</p>
                  <p className="text-[10px] text-muted-foreground">Wake Time</p>
                </div>
                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Activity className="h-4 w-4 text-cyan-500 mx-auto" />
                  </div>
                  <p className="text-xs font-medium">85%</p>
                  <p className="text-[10px] text-muted-foreground">Quality</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Today's Meals */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Todays Meals</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/meals")}>
                Track Meals
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Breakfast", key: "breakfast" },
                { name: "Lunch", key: "lunch" },
                { name: "Dinner", key: "dinner" },
                { name: "Snacks", key: "snacks" }
              ].map(({ name, key }) => {
                const status = getMealStatus(todaysMeals[key as keyof typeof todaysMeals]);

                const mealKey = key as keyof typeof todaysMeals;
                return (
                <div
                  key={name}
                  onClick={() => setSelectedMeal({ type: mealKey, name })}
                  className={`p-3 rounded-lg text-center space-y-2 ${
                    status.tracked ? 'bg-green-500/10' : 'bg-muted/50'
                  } cursor-pointer hover:bg-muted transition-colors`}
                >
                  <UtensilsCrossed className={`h-5 w-5 mx-auto ${
                    status.tracked ? 'text-green-500' : 'text-muted-foreground'
                  }`} />
                  <p className="text-sm font-medium">{name}</p>
                  {status.tracked ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="text-xs text-green-600">
                            {status.calories}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{status.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not tracked yet</p>
                  )}
                </div>
              )})}
            </div>
          </Card>

          {/* Habit Leaderboard */}
          <SupplementTracker />

          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Habit Champions</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1">
                            <Medal className={`h-4 w-4 ${
                              index === 0 ? "text-yellow-500" :
                              index === 1 ? "text-gray-400" :
                              "text-amber-600"
                            }`} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{user.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Habit Progress Chart */}
      <div className="mt-8 md:col-span-2">
        <ProgressChart />
      </div>

      {/* Meal Entry Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track {selectedMeal?.name}</DialogTitle>
            <DialogTitle>{selectedMeal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground">Calories</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Enter calories"
                value={selectedMeal ? todaysMeals[selectedMeal.type].calories : ''}
                onChange={(e) => handleCaloriesChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Notes</label>
              <Textarea
                placeholder="Add meal details..."
                value={selectedMeal ? todaysMeals[selectedMeal.type].notes : ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <Button onClick={handleSaveMeal} className="w-full">
              Save {selectedMeal?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}