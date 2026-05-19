import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Search from "@/pages/search";
import AuthPage from "@/pages/auth";
import Profile from "@/pages/profile";
import ListingDetail from "@/pages/listing-detail";
import Bookings from "@/pages/bookings";
import HostDashboard from "@/pages/host/dashboard";
import HostListings from "@/pages/host/listings";
import ListingForm from "@/pages/host/listing-form";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/listings/:id" component={ListingDetail} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/host/dashboard" component={HostDashboard} />
        <Route path="/host/listings" component={HostListings} />
        <Route path="/host/listings/new" component={ListingForm} />
        <Route path="/host/listings/:id/edit" component={ListingForm} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
