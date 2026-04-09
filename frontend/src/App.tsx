import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";
import Index from "./pages/Index";
import MeetingDashboard from "./pages/MeetingDashboard";
import GlobalDashboard from "./pages/GlobalDashboard";
import CreateMeeting from "./pages/CreateMeeting";
import NotFound from "./pages/NotFound";
import GuestVote from "./pages/GuestVote";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/m/:guestSlug" element={<GuestVote />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/meeting/:meetingId" element={<MeetingDashboard />} />
                <Route path="/dashboard" element={<GlobalDashboard />} />
                <Route path="/create" element={<CreateMeeting />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNavbar />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
