"use client";

import { Button } from "@/components/ui/button";
import { Bell, Settings, AlertCircle, Clock, Calendar as CalendarIcon, Sun, Moon, Menu } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useNotificationStore } from "@/lib/store/notification-store";
import { useTheme } from "next-themes";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { theme, setTheme } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Convert path to breadcrumbs
  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const segments = pathname.split('/').filter(Boolean);
    return segments.map(segment => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: segment
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:hidden px-[15px]">
          <Image
            src="https://revelationfintech.com/assets/revlogo.svg"
            alt="Logo"
            width={100}
            height={32}
            priority
            className="opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="flex flex-1 items-center justify-between">
          <div className="w-full flex-1">
            <nav className="hidden md:flex items-center text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  <span className="mx-2 text-muted-foreground">/</span>
                  <span className={index === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px]">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <Bell className="h-8 w-8 mb-2" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => {
                          markAsRead(notification.id);
                          router.push('/todo');
                        }}
                      >
                        <div className="flex gap-3">
                          {notification.type === 'overdue' ? (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          ) : notification.type === 'today' ? (
                            <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <CalendarIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="space-y-1">
                            <p className={notification.read ? 'text-muted-foreground' : 'font-medium'}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due: {format(parseISO(notification.deadline), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>

            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}