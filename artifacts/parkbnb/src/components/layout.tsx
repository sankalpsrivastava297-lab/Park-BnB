import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Search, Calendar, Menu, User, Home, LogOut, Bell, X, Car, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "booking_new":
      return <Car className="h-4 w-4 text-primary" />;
    case "booking_confirmed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "booking_cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-400" />;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Bell className="h-10 w-10 text-gray-200 mb-3" />
        <p className="text-sm font-medium text-gray-500">No notifications yet</p>
        <p className="text-xs text-gray-400 mt-1">Booking alerts will appear here</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => onMarkRead(n.id)}
          className={cn(
            "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
            !n.read && "bg-primary/5",
          )}
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <NotificationIcon type={n.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm", !n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
              {n.title}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
            {n.amount != null && (
              <p className="text-xs font-semibold text-primary mt-1">${n.amount.toFixed(2)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
          </div>
          {!n.read && (
            <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
      ))}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const userId = user?.id ? String(user.id) : null;
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications(userId);

  const isHost = user?.role === "host" || user?.role === "both";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
              P
            </div>
            <span className="hidden text-xl font-bold text-gray-900 md:block">ParkBnB</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 items-center rounded-full border bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
            <div className="flex-1 text-sm font-medium text-gray-900">Anywhere</div>
            <div className="h-4 w-[1px] bg-gray-300 mx-3"></div>
            <div className="flex-1 text-sm font-medium text-gray-900">Any week</div>
            <div className="h-4 w-[1px] bg-gray-300 mx-3"></div>
            <div className="flex-1 text-sm text-gray-500">Add vehicle</div>
            <div className="ml-3 rounded-full bg-primary p-2 text-white">
              <Search className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm font-medium text-gray-900 hover:text-primary cursor-pointer transition-colors">
              {isHost ? (
                <Link href="/host/dashboard">Host Dashboard</Link>
              ) : (
                <Link href="/auth">Earn from your parking</Link>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 hover:bg-gray-100">
                      <Bell className="h-5 w-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-xl overflow-hidden" sideOffset={8}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification list */}
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onClearAll={clearAll}
                      onMarkRead={markRead}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-gray-200 p-2 gap-2 h-auto flex items-center hover:shadow-md transition-all">
                    <Menu className="h-4 w-4 text-gray-500" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/bookings">
                    <DropdownMenuItem className="cursor-pointer">My Bookings</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  {isHost ? (
                    <>
                      <Link href="/host/dashboard">
                        <DropdownMenuItem className="cursor-pointer">Host Dashboard</DropdownMenuItem>
                      </Link>
                      <Link href="/host/listings">
                        <DropdownMenuItem className="cursor-pointer">Manage Listings</DropdownMenuItem>
                      </Link>
                    </>
                  ) : (
                    <DropdownMenuItem className="cursor-pointer">Become a Host</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" className="rounded-full">
                <Link href="/auth">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 pb-safe md:hidden">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        <Link href="/bookings" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.startsWith("/bookings") ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-medium">Bookings</span>
        </Link>

        {/* Mobile notification bell */}
        {user && (
          <button
            onClick={() => setNotifOpen(true)}
            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900`}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Alerts</span>
          </button>
        )}

        {isHost && (
          <Link href="/host/dashboard" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.startsWith("/host") ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Host</span>
          </Link>
        )}
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/profile" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
