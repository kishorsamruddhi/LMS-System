"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  subWeeks,
  addDays,
  isToday,
} from "date-fns";
import {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  CalendarDays,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface MealEntry {
  calories: string;
  notes: string;
}

interface DailyMeals {
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  snacks: MealEntry;
}

interface CalorieData {
  [date: string]: number;
}

const DAILY_CALORIE_TARGET = 2000;
const OVEREATING_THRESHOLD = 500;

const emptyMealEntry = { calories: "", notes: "" };

const initialMeals: DailyMeals = {
  breakfast: { ...emptyMealEntry },
  lunch: { ...emptyMealEntry },
  dinner: { ...emptyMealEntry },
  snacks: { ...emptyMealEntry },
};

const generateMockData = (): CalorieData => {
  const data: CalorieData = {};
  const today = new Date();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  
  eachDayOfInterval({ start: yearStart, end: yearEnd }).forEach(date => {
    if (date < today) {
      const variation = Math.random() * 1000 - 500;
      data[format(date, "yyyy-MM-dd")] = DAILY_CALORIE_TARGET + variation;
    }
  });
  
  return data;
};

export default function MealsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<DailyMeals>(initialMeals);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [yearlyData, setYearlyData] = useState<CalorieData>(generateMockData());
  const [selectedMeal, setSelectedMeal] = useState<{ name: string; type: keyof DailyMeals } | null>(null);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const totalCalories = Object.values(meals).reduce(
    (sum, meal) => sum + (parseInt(meal.calories) || 0),
    0
  );

  const isOverTarget = totalCalories > DAILY_CALORIE_TARGET;

  const getContributionColor = (calories: number | undefined) => {
    if (!calories) return "bg-secondary/20 dark:bg-secondary/10";
    
    const difference = calories - DAILY_CALORIE_TARGET;
    const percentage = Math.min(Math.abs(difference) / OVEREATING_THRESHOLD, 1);
    
    if (difference > 0) {
      if (percentage < 0.25) return "bg-red-200 dark:bg-red-950";
      if (percentage < 0.5) return "bg-red-300 dark:bg-red-900";
      if (percentage < 0.75) return "bg-red-400 dark:bg-red-800";
      return "bg-red-500 dark:bg-red-700";
    } else if (difference < 0) {
      if (percentage < 0.25) return "bg-green-200 dark:bg-green-950";
      if (percentage < 0.5) return "bg-green-300 dark:bg-green-900";
      if (percentage < 0.75) return "bg-green-400 dark:bg-green-800";
      return "bg-green-500 dark:bg-green-700";
    }
    
    return "bg-secondary/50 dark:bg-secondary/30";
  };

  const handleCaloriesChange = (meal: keyof DailyMeals, value: string) => {
    // Only allow positive numbers
    if (value && !/^\d+$/.test(value)) return;
    
    setMeals(prev => ({
      ...prev,
      [meal]: { ...prev[meal], calories: value }
    }));
  };

  const handleNotesChange = (meal: keyof DailyMeals, value: string) => {
    setMeals(prev => ({
      ...prev,
      [meal]: { ...prev[meal], notes: value }
    }));
  };

  const handleSave = () => {
    if (!date) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Save to localStorage
    const savedMeals = JSON.parse(localStorage.getItem('meals') || '{}');
    savedMeals[dateStr] = {
      ...meals,
      totalCalories,
    };
    localStorage.setItem('meals', JSON.stringify(savedMeals));
    
    // Update yearly data for the heatmap
    setYearlyData(prev => ({ ...prev, [dateStr]: totalCalories }));
    
    // Show success feedback
    setNotification({ type: 'success', message: 'Meals saved successfully!' });
  };

  const handleClear = () => {
    setMeals(initialMeals);
    setNotification({ type: 'success', message: 'Meal entries cleared' });
  };

  // Load saved meals for selected date
  useEffect(() => {
    if (!date) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const savedMeals = JSON.parse(localStorage.getItem('meals') || '{}');
    
    if (savedMeals[dateStr]) {
      const { totalCalories, ...mealData } = savedMeals[dateStr];
      setMeals(mealData);
    } else {
      setMeals(initialMeals);
    }
  }, [date]);

  const MealCard = ({ 
    title, 
    icon: Icon, 
    meal 
  }: { 
    title: string; 
    icon: any; 
    meal: keyof DailyMeals;
  }) => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Calories</label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="Enter calories"
            value={meals[meal].calories}
            onChange={(e) => handleCaloriesChange(meal, e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Notes</label>
          <Textarea
            placeholder="Add meal details..."
            value={meals[meal].notes}
            onChange={(e) => handleNotesChange(meal, e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Notification */}
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Yearly Overview */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Yearly Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-secondary/20 dark:bg-secondary/10" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-950" />
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-800" />
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-700" />
            </div>
            <span>Target</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-950" />
              <div className="w-3 h-3 rounded-sm bg-red-300 dark:bg-red-900" />
              <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-800" />
              <div className="w-3 h-3 rounded-sm bg-red-500 dark:bg-red-700" />
            </div>
            <span>More</span>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="inline-flex gap-[2px]">
              {Array.from({ length: 52 }).map((_, weekIndex) => {
                const weekStart = subWeeks(endOfYear(new Date()), 52 - weekIndex - 1);
                return (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const date = addDays(weekStart, dayIndex);
                      const dateStr = format(date, "yyyy-MM-dd");
                      const calories = yearlyData[dateStr];
                      
                      return (
                        <TooltipProvider key={dayIndex}>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`w-[10px] h-[10px] rounded-sm ${getContributionColor(calories)} ${
                                  isToday(date) ? "ring-1 ring-primary ring-offset-1" : ""
                                }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-medium">{format(date, "MMM d, yyyy")}</p>
                                {calories ? (
                                  <p>{calories.toFixed(0)} calories</p>
                                ) : (
                                  <p>No data</p>
                                )}
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

      {/* Daily Input Form */}
      <div className="space-y-6">
        {/* Header and Date Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Daily Tracker</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Daily Summary Card */}
        <Card className={`p-4 ${
          isOverTarget ? 'bg-red-500/10 border-red-200' : 'bg-green-500/10 border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`h-6 w-6 ${
              isOverTarget ? 'text-red-500' : 'text-green-500'
            }`} />
            <div>
              <h2 className="font-medium text-lg">Daily Summary</h2>
              <p className="text-sm text-muted-foreground">
                Total Calories: <span className="font-medium">{totalCalories}</span> / {DAILY_CALORIE_TARGET}
                {isOverTarget ? 
                  <span className="text-red-500 ml-2">(exceeded by {totalCalories - DAILY_CALORIE_TARGET})</span> : 
                  <span className="text-green-500 ml-2">(within target)</span>
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Meal Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MealCard title="Breakfast" icon={Coffee} meal="breakfast" />
          <MealCard title="Lunch" icon={UtensilsCrossed} meal="lunch" />
          <MealCard title="Dinner" icon={Moon} meal="dinner" />
          <MealCard title="Snacks" icon={Cookie} meal="snacks" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track {selectedMeal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground">Calories</label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}