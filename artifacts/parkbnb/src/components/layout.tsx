import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Search, Calendar, Menu, User, Home, LogOut, Bell, X, Car, CheckCircle, XCircle, ChevronRight, Building2, ArrowLeftRight } from "lucide-react";
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

// ── Mode context ────────────────────────────────────────────────
type Mode = "driver" | "host";

const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: "driver",
  setMode: () => {},
});

export function useMode() {
  return useContext(ModeContext);
}

// ── Notification helpers ────────────────────────────────────────
function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "booking_new":       return <Car className="h-4 w-4 text-primary" />;
    case "booking_confirmed": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "booking_cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
    default:                  return <Bell className="h-4 w-4 text-gray-400" />;
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
  notifications, unreadCount, onMarkAllRead, onClearAll, onMarkRead,
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
          className={cn("flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors", !n.read && "bg-primary/5")}
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
              <p className="text-xs font-semibold text-primary mt-1">₹{n.amount.toFixed(0)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
          </div>
          {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
      ))}
    </div>
  );
}

// ── Mode switcher pill ──────────────────────────────────────────
function ModePill({ mode, onSwitch }: { mode: Mode; onSwitch: () => void }) {
  return (
    <button
      onClick={onSwitch}
      className={cn(
        "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
        mode === "driver"
          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      )}
    >
      {mode === "driver" ? (
        <><Car className="h-3.5 w-3.5" /> Driver</>
      ) : (
        <><Building2 className="h-3.5 w-3.5" /> Host</>
      )}
      <ArrowLeftRight className="h-3 w-3 opacity-60" />
    </button>
  );
}

// ── Main layout ─────────────────────────────────────────────────
export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const [mode, setModeState] = useState<Mode>(() => {
    try { return (localStorage.getItem("parkbnb_mode") as Mode) || "driver"; } catch { return "driver"; }
  });

  const setMode = (m: Mode) => {
    setModeState(m);
    try { localStorage.setItem("parkbnb_mode", m); } catch {}
    // Navigate to the right home for the new mode
    if (m === "host") setLocation("/host/dashboard");
    else setLocation("/");
  };

  const toggleMode = () => setMode(mode === "driver" ? "host" : "driver");

  const userId = user?.id ? String(user.id) : null;
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications(userId);

  const isLoggedIn = !!user;

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      <div className="min-h-[100dvh] flex flex-col bg-gray-50 pb-16 md:pb-0">

        {/* Mode banner (mobile) */}
        {isLoggedIn && (
          <div className={cn(
            "flex md:hidden items-center justify-between px-4 py-1.5 text-xs font-semibold",
            mode === "driver" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
          )}>
            <span className="flex items-center gap-1.5">
              {mode === "driver" ? <Car className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              {mode === "driver" ? "Driver Mode" : "Host Mode"}
            </span>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1 opacity-90 hover:opacity-100"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Switch to {mode === "driver" ? "Host" : "Driver"}
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
            <Link href={mode === "host" ? "/host/dashboard" : "/"} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
                P
              </div>
              <span className="hidden text-xl font-bold text-gray-900 md:block">ParkBnB</span>
            </Link>

            {/* Desktop Search Bar — only in driver mode */}
            {mode === "driver" && (
              <div
                onClick={() => setLocation("/search")}
                className="hidden md:flex flex-1 max-w-md mx-8 items-center rounded-full border bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
              >
                <div className="flex-1 text-sm font-medium text-gray-900">Anywhere</div>
                <div className="h-4 w-[1px] bg-gray-300 mx-3" />
                <div className="flex-1 text-sm font-medium text-gray-900">Any week</div>
                <div className="h-4 w-[1px] bg-gray-300 mx-3" />
                <div className="flex-1 text-sm text-gray-500">Add vehicle</div>
                <div className="ml-3 rounded-full bg-primary p-2 text-white">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Host mode header links */}
            {mode === "host" && (
              <div className="hidden md:flex flex-1 mx-8 items-center gap-6">
                <Link href="/host/dashboard" className={cn("text-sm font-medium transition-colors", location === "/host/dashboard" ? "text-primary" : "text-gray-600 hover:text-gray-900")}>
                  Dashboard
                </Link>
                <Link href="/host/listings" className={cn("text-sm font-medium transition-colors", location === "/host/listings" ? "text-primary" : "text-gray-600 hover:text-gray-900")}>
                  My Listings
                </Link>
                <Link href="/host/listings/new" className={cn("text-sm font-medium transition-colors", location === "/host/listings/new" ? "text-primary" : "text-gray-600 hover:text-gray-900")}>
                  + Add Spot
                </Link>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              {/* Mode pill — desktop */}
              {isLoggedIn && <ModePill mode={mode} onSwitch={toggleMode} />}

              {/* Notification Bell */}
              {isLoggedIn && (
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
                          <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onClearAll={clearAll}
                      onMarkRead={markRead}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User menu */}
              {isLoggedIn ? (
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
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl">
                    {/* User info */}
                    <div className="px-2 py-2 mb-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {/* Mode switcher — prominent card inside dropdown */}
                    <div className={cn(
                      "mx-0 mb-2 rounded-xl p-3 flex items-center justify-between",
                      mode === "driver" ? "bg-blue-50" : "bg-amber-50"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          mode === "driver" ? "bg-blue-600" : "bg-amber-500"
                        )}>
                          {mode === "driver"
                            ? <Car className="h-4 w-4 text-white" />
                            : <Building2 className="h-4 w-4 text-white" />
                          }
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", mode === "driver" ? "text-blue-800" : "text-amber-800")}>
                            {mode === "driver" ? "Driver Mode" : "Host Mode"}
                          </p>
                          <p className={cn("text-[10px]", mode === "driver" ? "text-blue-600" : "text-amber-600")}>
                            {mode === "driver" ? "Booking parking spots" : "Managing your listings"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleMode}
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors",
                          mode === "driver"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-amber-500 text-white hover:bg-amber-600"
                        )}
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        Switch
                      </button>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Driver links */}
                    {mode === "driver" && (
                      <>
                        <Link href="/bookings">
                          <DropdownMenuItem className="cursor-pointer rounded-lg gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" /> My Bookings
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/profile">
                          <DropdownMenuItem className="cursor-pointer rounded-lg gap-2">
                            <User className="h-4 w-4 text-gray-500" /> Profile
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    {/* Host links */}
                    {mode === "host" && (
                      <>
                        <Link href="/host/dashboard">
                          <DropdownMenuItem className="cursor-pointer rounded-lg gap-2">
                            <Home className="h-4 w-4 text-gray-500" /> Dashboard
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/host/listings">
                          <DropdownMenuItem className="cursor-pointer rounded-lg gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" /> My Listings
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/profile">
                          <DropdownMenuItem className="cursor-pointer rounded-lg gap-2">
                            <User className="h-4 w-4 text-gray-500" /> Profile
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg gap-2">
                      <LogOut className="h-4 w-4" /> Log out
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
          {mode === "driver" ? (
            <>
              <Link href="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                <Search className="h-5 w-5" />
                <span className="text-[10px] font-medium">Explore</span>
              </Link>
              <Link href="/bookings" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.startsWith("/bookings") ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                <Calendar className="h-5 w-5" />
                <span className="text-[10px] font-medium">Bookings</span>
              </Link>
              {isLoggedIn && (
                <button
                  onClick={() => setNotifOpen(true)}
                  className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900"
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
              <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/profile" ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}>
                <User className="h-5 w-5" />
                <span className="text-[10px] font-medium">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/host/dashboard" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/host/dashboard" ? "text-amber-600" : "text-gray-500 hover:text-gray-900"}`}>
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-medium">Dashboard</span>
              </Link>
              <Link href="/host/listings" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/host/listings" ? "text-amber-600" : "text-gray-500 hover:text-gray-900"}`}>
                <Building2 className="h-5 w-5" />
                <span className="text-[10px] font-medium">Listings</span>
              </Link>
              {isLoggedIn && (
                <button
                  onClick={() => setNotifOpen(true)}
                  className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900"
                >
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">Alerts</span>
                </button>
              )}
              <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location === "/profile" ? "text-amber-600" : "text-gray-500 hover:text-gray-900"}`}>
                <User className="h-5 w-5" />
                <span className="text-[10px] font-medium">Profile</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </ModeContext.Provider>
  );
}
