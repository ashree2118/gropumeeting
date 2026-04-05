import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import MeetingDashboard from "./pages/MeetingDashboard";
import GlobalDashboard from "./pages/GlobalDashboard";
import CreateMeeting from "./pages/CreateMeeting";
import NotFound from "./pages/NotFound";
import GuestVote from "./pages/GuestVote";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/m/:guestSlug" element={<GuestVote />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/meeting/:meetingId" element={<MeetingDashboard />} />
              <Route path="/dashboard" element={<GlobalDashboard />} />
              <Route path="/create" element={<CreateMeeting />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
