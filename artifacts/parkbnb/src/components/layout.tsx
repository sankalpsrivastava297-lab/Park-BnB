import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Search, MapPin, Calendar, Menu, User, Car, Home, LogOut } from "lucide-react";
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

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isHost = user?.role === 'host' || user?.role === 'both';

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

          {/* Desktop Search Bar Placeholder */}
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

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm font-medium text-gray-900 hover:text-primary cursor-pointer transition-colors">
              {isHost ? (
                <Link href="/host/dashboard">Host Dashboard</Link>
              ) : (
                <Link href="/auth">Earn from your parking</Link>
              )}
            </div>

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
