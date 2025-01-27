"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  isBefore,
  subWeeks,
  eachDayOfInterval,
} from "date-fns";
import { Plus, X, Edit2, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface HealthData {
  id: string;
  name: string;
  values: { [date: string]: number };
  currentStreak: number;
  longestStreak: number;
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [newHealthName, setNewHealthName] = useState("");
  const [editingHealth, setEditingHealth] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load health data from localStorage on mount
  useEffect(() => {
    const savedHealthData = localStorage.getItem("healthData");
    if (savedHealthData) {
      try {
        const parsed = JSON.parse(savedHealthData);
        setHealthData(parsed);
      } catch (error) {
        console.error("Error parsing saved health data:", error);
        setHealthData([]);
      }
    }
  }, []);

  // Save health data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("healthData", JSON.stringify(healthData));
  }, [healthData]);

  const calculateStreak = (values: { [date: string]: number }): { current: number; longest: number } => {
    const completedDates = Object.keys(values).filter(date => values[date] > 0);
    if (completedDates.length === 0) return { current: 0, longest: 0 };

    const sortedDates = [...completedDates]
      .sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let currentDate = new Date();
    let streakBroken = false;

    // Calculate current streak
    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (completedDates.includes(dateStr)) {
        currentStreak++;
      } else if (!streakBroken && isBefore(currentDate, new Date())) {
        streakBroken = true;
        break;
      }
      currentDate = subWeeks(currentDate, 1);
    }

    // Calculate longest streak
    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = parseISO(sortedDates[i]);
      const nextDate = i < sortedDates.length - 1 ? parseISO(sortedDates[i + 1]) : null;

      tempStreak++;

      if (!nextDate || Math.abs(currentDate.getTime() - nextDate.getTime()) > 8.64e7) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const addHealthRecord = () => {
    if (!newHealthName.trim()) return;
    
    const newHealth: HealthData = {
      id: Date.now().toString(),
      name: newHealthName,
      values: {},
      currentStreak: 0,
      longestStreak: 0,
    };
    
    setHealthData([...healthData, newHealth]);
    setNewHealthName("");
  };

  const toggleHealthCompletion = (healthId: string, date: Date, value: number) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setHealthData(healthData.map(health => {
      if (health.id === healthId) {
        const newValues = { ...health.values, [dateStr]: value };
        const { current, longest } = calculateStreak(newValues);
        
        return {
          ...health,
          values: newValues,
          currentStreak: current,
          longestStreak: longest,
        };
      }
      return health;
    }));
  };

  const deleteHealthRecord = (healthId: string) => {
    setHealthData(healthData.filter(health => health.id !== healthId));
  };

  const updateHealthName = (healthId: string, newName: string) => {
    if (!newName.trim()) return;
    setHealthData(healthData.map(health =>
      health.id === healthId ? { ...health, name: newName } : health
    ));
    setEditingHealth(null);
  };

  const generateMonthGrid = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-8">Health Tracker</h1>

      {/* Yearly Progress Grid */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Yearly Progress</h2>

          {/* Contribution grid */}
          <div className="flex gap-[2px]">
            {Array.from({ length: 52 }).map((_, weekIndex) => {
              const weekStart = subWeeks(new Date(), 52 - weekIndex);
              return (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + dayIndex);
										const completions = healthData.filter(health =>
											health.values[format(date, "yyyy-MM-dd")] > 0
										).length;
										
                    
                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`w-[10px] h-[10px] rounded-sm bg-emerald-200 ${isToday(date) ? "ring-1 ring-primary ring-offset-1" : ""}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-medium">{format(date, "MMM d, yyyy")}</p>
                              <p>{completions} health records completed</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Add New Health Record */}
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="New health record name"
            value={newHealthName}
            onChange={(e) => setNewHealthName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHealthRecord()}
          />
          <Button onClick={addHealthRecord}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </Card>

      {/* Individual Health Records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthData.map((health) => (
          <Card key={health.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              {editingHealth === health.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={health.name}
                    onChange={(e) =>
                      setHealthData(healthData.map(h =>
                        h.id === health.id ? { ...h, name: e.target.value } : h
                      ))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateHealthName(health.id, health.name);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateHealthName(health.id, health.name)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-semibold truncate max-w-[120px]">{health.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingHealth(health.id)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => deleteHealthRecord(health.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2 space-y-1">
              <div>Current Streak: {health.currentStreak} days</div>
              <div>Longest Streak: {health.longestStreak} days</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {generateMonthGrid(currentMonth).map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const value = health.values[dateStr] ?? 0;

                return (
                  <Button
                    key={dateStr}
                    size="icon"
                    variant={value > 0 ? "secondary" : "outline"}
                    onClick={() => toggleHealthCompletion(health.id, date, value > 0 ? 0 : 1)}
                  >
                    {value > 0 ? "✔" : ""}
                  </Button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
