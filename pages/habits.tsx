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
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  getWeeksInMonth,
  isSameDay,
  isToday,
  subWeeks,
  parseISO,
  isBefore,
} from "date-fns";
import { Plus, X, Edit2, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  currentStreak: number;
  longestStreak: number;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load habits from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        setHabits(parsed);
      } catch (error) {
        console.error("Error parsing saved habits:", error);
        setHabits([]);
      }
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const calculateStreak = (completedDates: string[]): { current: number; longest: number } => {
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

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName("");
  };

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(dateStr);
        const newCompletedDates = isCompleted
          ? habit.completedDates.filter(d => d !== dateStr)
          : [...habit.completedDates, dateStr];
        
        const { current, longest } = calculateStreak(newCompletedDates);
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          currentStreak: current,
          longestStreak: longest,
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  const updateHabitName = (habitId: string, newName: string) => {
    if (!newName.trim()) return;
    setHabits(habits.map(habit =>
      habit.id === habitId ? { ...habit, name: newName } : habit
    ));
    setEditingHabit(null);
  };

  const getCompletionsForDate = (date: Date): number => {
    const dateStr = format(date, "yyyy-MM-dd");
    return habits.filter(habit => habit.completedDates.includes(dateStr)).length;
  };

  const getContributionLevel = (completions: number): string => {
    if (completions === 0) return "bg-secondary/20 dark:bg-secondary/10";
    if (completions === 1) return "bg-emerald-200/60 dark:bg-emerald-900/60";
    if (completions === 2) return "bg-emerald-300 dark:bg-emerald-800";
    if (completions <= 4) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-500 dark:bg-emerald-600";
  };

  const generateMonthGrid = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-8">Habit Tracker</h1>

      {/* Yearly Progress Grid */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Yearly Progress</h2>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-secondary/20 dark:bg-secondary/10" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200/60 dark:bg-emerald-900/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
            </div>
            <span>More</span>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="inline-flex">
              {/* Month labels */}
              <div className="flex text-xs text-muted-foreground mb-2">
                {months.map((month, index) => {
                  const date = new Date(new Date().getFullYear(), index, 1);
                  const weeksInMonth = getWeeksInMonth(date);
                  const style = { width: `${weeksInMonth * 11 + (weeksInMonth - 1) * 2}px` };
                  return (
                    <div key={month} style={style} className="text-left">
                      {month}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contribution grid */}
            <div className="flex gap-[2px]">
              {Array.from({ length: 52 }).map((_, weekIndex) => {
                const weekStart = subWeeks(new Date(), 52 - weekIndex);
                return (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const date = new Date(weekStart);
                      date.setDate(date.getDate() + dayIndex);
                      const completions = getCompletionsForDate(date);
                      
                      return (
                        <TooltipProvider key={dayIndex}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`w-[10px] h-[10px] rounded-sm ${getContributionLevel(completions)} ${
                                  isToday(date) ? "ring-1 ring-primary ring-offset-1" : ""
                                }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-medium">{format(date, "MMM d, yyyy")}</p>
                                <p>{completions} habits completed</p>
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
        </div>
      </Card>

      {/* Add New Habit */}
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="New habit name"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
          />
          <Button onClick={addHabit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </Card>

      {/* Individual Habits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              {editingHabit === habit.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={habit.name}
                    onChange={(e) =>
                      setHabits(habits.map(h =>
                        h.id === habit.id ? { ...h, name: e.target.value } : h
                      ))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateHabitName(habit.id, habit.name);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateHabitName(habit.id, habit.name)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-semibold truncate max-w-[120px]">{habit.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingHabit(habit.id)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2 space-y-1">
              <div>Current Streak: {habit.currentStreak} days</div>
              <div>Longest Streak: {habit.longestStreak} days</div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium">
                {format(currentMonth, "MMM yyyy")}
              </h4>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Month Grid */}
            <div className="w-full">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-[2px] mb-[2px]">
                {weekDays.map((day) => (
                  <div key={day} className="text-[10px] text-center text-muted-foreground">
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-[2px]">
                {generateMonthGrid(currentMonth).map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isCompleted = habit.completedDates.includes(dateStr);
                  const isCurrentMonth = format(day, "M") === format(currentMonth, "M");

                  return (
                    <TooltipProvider key={dateStr}>
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => toggleHabitCompletion(habit.id, day)}
                            className={`w-full aspect-square rounded-sm transition-colors ${
                              !isCurrentMonth
                                ? "opacity-25"
                                : isCompleted
                                ? "bg-emerald-500 dark:bg-emerald-600"
                                : "bg-secondary/20 dark:bg-secondary/10 hover:bg-secondary/40"
                            } ${isToday(day) ? "ring-1 ring-primary ring-offset-1" : ""}`}
                          >
                            <span className="text-[10px]">{format(day, "d")}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-medium">{format(day, "MMM d, yyyy")}</p>
                            <p>{isCompleted ? "Completed" : "Not completed"}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}