"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Plus,
  Pill,
  Check,
  X,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Supplement {
  id: string;
  name: string;
  type: "supplement" | "medicine";
  frequency: "daily" | "morning" | "afternoon" | "evening" | "custom";
  dosage: string;
  notes?: string;
}

interface DailyRecord {
  date: string;
  taken: { [key: string]: boolean };
}

export function SupplementTracker() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [newSupplement, setNewSupplement] = useState<Omit<Supplement, "id">>({
    name: "",
    type: "supplement",
    frequency: "daily",
    dosage: "",
  });

  // Load data from localStorage
  useEffect(() => {
    const savedSupplements = JSON.parse(localStorage.getItem('supplements') || '[]');
    const savedRecords = JSON.parse(localStorage.getItem('supplementRecords') || '[]');
    setSupplements(savedSupplements);
    setDailyRecords(savedRecords);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('supplements', JSON.stringify(supplements));
  }, [supplements]);

  useEffect(() => {
    localStorage.setItem('supplementRecords', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddSupplement = () => {
    if (!newSupplement.name.trim() || !newSupplement.dosage.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const supplement: Supplement = {
      ...newSupplement,
      id: crypto.randomUUID(),
    };

    setSupplements([...supplements, supplement]);
    setNewSupplement({
      name: "",
      type: "supplement",
      frequency: "daily",
      dosage: "",
    });
    setIsDialogOpen(false);
    setNotification({ type: 'success', message: 'Supplement added successfully' });
  };

  const handleDeleteSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
    setDailyRecords(dailyRecords.map(record => ({
      ...record,
      taken: Object.fromEntries(
        Object.entries(record.taken).filter(([key]) => key !== id)
      ),
    })));
    setNotification({ type: 'success', message: 'Supplement deleted successfully' });
  };

  const toggleTaken = (supplementId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const recordIndex = dailyRecords.findIndex(r => r.date === today);

    if (recordIndex === -1) {
      // Create new record for today
      setDailyRecords([
        ...dailyRecords,
        {
          date: today,
          taken: { [supplementId]: true },
        },
      ]);
    } else {
      // Update existing record
      setDailyRecords(dailyRecords.map((record, index) => {
        if (index === recordIndex) {
          return {
            ...record,
            taken: {
              ...record.taken,
              [supplementId]: !record.taken[supplementId],
            },
          };
        }
        return record;
      }));
    }
  };

  const getTodayStatus = (supplementId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const record = dailyRecords.find(r => r.date === today);
    return record?.taken[supplementId] || false;
  };

  return (
    <Card className="p-3">
      {notification && (
        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold">Supplements</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Supplement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={newSupplement.name}
                  onChange={(e) =>
                    setNewSupplement({ ...newSupplement, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={newSupplement.frequency}
                  onValueChange={(value: Supplement["frequency"]) =>
                    setNewSupplement({ ...newSupplement, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Dosage (e.g., 1 pill, 500mg)"
                  value={newSupplement.dosage}
                  onChange={(e) =>
                    setNewSupplement({ ...newSupplement, dosage: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Notes (optional)"
                  value={newSupplement.notes}
                  onChange={(e) =>
                    setNewSupplement({ ...newSupplement, notes: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddSupplement} className="w-full">
                Add Supplement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[150px] pr-2">
        <div className="space-y-2">
          {supplements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No supplements added yet
            </p>
          ) : (
            supplements.map((supplement) => {
              const taken = getTodayStatus(supplement.id);
              return (
                <div
                  key={supplement.id}
                  className={`flex items-center justify-between p-1.5 rounded-lg ${
                    taken ? 'bg-muted/50' : 'bg-muted/50 border border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant={taken ? "default" : "outline"}
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => toggleTaken(supplement.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <div>
                      <p className="text-xs font-medium">{supplement.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {supplement.dosage} • {supplement.frequency}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteSupplement(supplement.id)}
                      >
                        <X className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}