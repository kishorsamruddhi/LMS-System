"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Building2,
  CalendarDays, 
  StickyNote,
  ClipboardCheck,
  UtensilsCrossed,
  Repeat,
  Users,
  Flame,
  AlertTriangle,
  Bell,
  Moon,
  Activity,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useBoardStore } from "@/lib/store";
import { parseISO, isToday } from "date-fns";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationCategory {
  name: string;
  items: {
    href: string;
    icon: any;
    label: string;
  }[];
}

const navigationCategories: NavigationCategory[] = [
  {
    name: "General",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Workstation" },
    ]
  },
  {
    name: "Hustle",
    items: [
      { href: "/todo", icon: CheckSquare, label: "Tasks" },
      { href: "/work-tasks", icon: CheckSquare, label: "Work Tasks" },
      { href: "/crm", icon: Building2, label: "CRM" },
      { href: "/contacts", icon: Users, label: "Contacts" },
      { href: "/calendar", icon: CalendarDays, label: "Calendar" },
      { href: "/notes", icon: StickyNote, label: "Notes" },
    ]
  },
  {
    name: "Lifestyle",
    items: [
      { href: "/adhd", icon: Bell, label: "ADHD" },
      { href: "/habits", icon: Repeat, label: "Habits" },
      { href: "/meals", icon: UtensilsCrossed, label: "Meals" },
      { href: "/sleep", icon: Moon, label: "Sleep" },
      { href: "/health", icon: Activity, label: "Health" }
    ]
  },
  {
    name: "Government Job",
    items: [
      { href: "/attendance", icon: ClipboardCheck, label: "Attendance" },
    ]
  },
  {
    name: "Social",
    items: [
      { href: "/social", icon: Users, label: "Friends" }
    ]
  },
  {
    name: "Leisure",
    items: [
      { href: "/anime", icon: Flame, label: "Anime" }
    ]
  }
];

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { tasks } = useBoardStore();

  // Check for important pending tasks
  const hasImportantTasks = Object.values(tasks).some(task => 
    task.columnId === "pending" && 
    task.priority === "high" && 
    isToday(parseISO(task.deadline))
  );

  return (
    <div className={cn(
      "relative min-h-screen flex flex-col border-r bg-background/10 backdrop-blur-[20px] supports-[backdrop-filter]:bg-background/10",
      isOpen ? "fixed inset-0 z-50" : "hidden md:flex",
      className
    )}>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-center border-b bg-background/10 backdrop-blur-[20px] supports-[backdrop-filter]:bg-background/10">
        <div className="absolute right-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center mb-4">
          <Image
            src="https://revelationfintech.com/assets/revlogo.svg"
            alt="Logo"
            width={100}
            height={28}
            priority
            className="opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 pb-16 md:pb-0">
        {navigationCategories.map((category) => (
          <div key={category.name} className="py-2">
            <h2 className="mb-1 px-2 text-[10px] font-medium tracking-wider text-muted-foreground/70 uppercase">
              {category.name}
            </h2>
            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isExternalLink = item.href.startsWith('http');
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    target={isExternalLink ? "_blank" : undefined}
                    rel={isExternalLink ? "noopener noreferrer" : undefined}
                    onClick={onClose}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start h-8 px-2 text-sm transition-colors relative"
                      size="sm"
                    >
                      {item.label === "Tasks" && hasImportantTasks ? (
                        <AlertTriangle className="mr-2 h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <Icon className="mr-2 h-3.5 w-3.5" />
                      )}
                      {item.label}
                      {item.label === "Tasks" && hasImportantTasks && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}