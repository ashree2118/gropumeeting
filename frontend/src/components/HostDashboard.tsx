import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  Target,
  Copy,
  PartyPopper,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import DashboardHeatmap from "@/components/DashboardHeatmap";
import { fetchAiSuggestions, confirmMeeting } from "@/lib/api";
import type { DashboardGuestRow, DashboardMeetingRow } from "@/lib/api";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function guestHasResponded(guest: DashboardGuestRow): boolean {
  return (guest.availabilities?.length ?? 0) > 0;
}

export interface HostDashboardProps {
  meeting: DashboardMeetingRow;
  guests: DashboardGuestRow[];
  guestLink: string;
  adminSlug: string;
}

interface AiSuggestion {
  suggestedStartTime: string | null;
  attendeeCount: number;
  explanation: string;
  missingGuests?: string[];
  noData?: boolean;
}

const HostDashboard = ({ meeting, guests, guestLink, adminSlug }: HostDashboardProps) => {
  const proposedDates = Array.isArray(meeting.proposedDates)
    ? meeting.proposedDates.map((d) => (typeof d === "string" ? d : String(d)))
    : [];

  const respondedCount = guests.filter(guestHasResponded).length;
  const totalGuests = guests.length;

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingConfirmTime, setPendingConfirmTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const suggestions = await fetchAiSuggestions(meeting.id);
      setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
      toast.success("AI suggestions generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch AI suggestions");
      setAiSuggestions([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectTime = (suggestedStartTime: string) => {
    setPendingConfirmTime(suggestedStartTime);
  };

  const handleConfirmMeeting = async () => {
    if (!pendingConfirmTime) return;
    setIsConfirming(true);
    try {
      await confirmMeeting(adminSlug, { finalStartTime: pendingConfirmTime });
      toast.success("Meeting confirmed! Invitations have been sent.");
      // Reload to reflect the confirmed state
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm meeting");
    } finally {
      setIsConfirming(false);
    }
  };

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink).then(
      () => toast.success("Guest link copied"),
      () => toast.error("Could not copy link")
    );
  };

  return (
    <div className="flex min-h-screen bg-background pt-24">
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
              Host Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Review responses and confirm the best time
            </p>
          </div>

          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">{meeting.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <Target className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    {meeting.description?.trim() || "No description provided."}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Clock className="h-3 w-3" />
                      {meeting.durationMinutes} min
                    </Badge>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Users className="h-3 w-3" />
                      {respondedCount}/{totalGuests} responded
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finalized time banner */}
          {meeting.status === 'CONFIRMED' && meeting.finalStartTime && meeting.finalEndTime && (
            <Card className="border-primary/30 bg-primary/5 shadow-sm rounded-2xl">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    <PartyPopper className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Meeting Confirmed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Finalized for:{" "}
                      <span className="font-medium text-foreground">
                        {format(new Date(meeting.finalStartTime), "MMM d, h:mm a")}
                        {" – "}
                        {format(new Date(meeting.finalEndTime), "h:mm a")}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Smart Arbitrator Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAiSuggestions}
              disabled={isAiLoading}
              className="gap-2 bg-gradient-to-r from-yellow-200 to-blue-300 text-black hover:from-yellow-300 hover:to-blue-400 shadow-md"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing schedules...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ask AI for Best Times
                </>
              )}
            </Button>
          </div>

          {/* AI Suggestions / Confirm Time Section */}
          {aiSuggestions.length > 0 && (
            <div className="space-y-4">
              {pendingConfirmTime ? (
                /* ── Confirm Time View ── */
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Confirm Meeting Time
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review and confirm the selected time slot
                    </p>
                  </div>

                  <Card className="border-primary/40 bg-primary/5 shadow-md rounded-2xl">
                    <CardContent className="pt-6 pb-6">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                            <CalendarDays className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-semibold text-foreground">
                              {format(new Date(pendingConfirmTime), "EEEE, MMM d, yyyy")}
                            </p>
                            <p className="text-base text-foreground/80">
                              {format(new Date(pendingConfirmTime), "h:mm a")}
                              {" – "}
                              {format(
                                new Date(new Date(pendingConfirmTime).getTime() + meeting.durationMinutes * 60000),
                                "h:mm a"
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              All guests will be notified via email once confirmed.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setPendingConfirmTime(null)}
                            disabled={isConfirming}
                          >
                            <ArrowLeft className="h-4 w-4" />
                            See suggestions
                          </Button>
                          <Button
                            className="gap-2 flex-1"
                            onClick={handleConfirmMeeting}
                            disabled={isConfirming}
                          >
                            {isConfirming ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Confirm Meeting
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* ── Suggestions List View ── */
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      AI Suggestions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Smart scheduling powered by AI analysis
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aiSuggestions[0]?.noData ? (
                      <Card className="border-border bg-muted/50 shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">
                                {aiSuggestions[0].explanation}
                              </p>
                              {aiSuggestions[0].missingGuests && aiSuggestions[0].missingGuests.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Waiting on: {aiSuggestions[0].missingGuests.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      aiSuggestions.map((suggestion, idx) => {
                        const endTime = new Date(
                          new Date(suggestion.suggestedStartTime).getTime() +
                            meeting.durationMinutes * 60000
                        );
                        return (
                          <Card key={idx} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                {/* Time Display */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Suggested Time</p>
                                    <p className="text-lg font-semibold text-foreground">
                                      {format(new Date(suggestion.suggestedStartTime), "MMM d, yyyy")}
                                    </p>
                                    <p className="text-base text-foreground/80">
                                      {format(new Date(suggestion.suggestedStartTime), "h:mm a")}
                                      {" – "}
                                      {format(endTime, "h:mm a")}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-600/90 hover:bg-green-700 gap-1 text-white">
                                    <Users className="h-3 w-3" />
                                    {suggestion.attendeeCount}/{totalGuests} can attend
                                  </Badge>
                                </div>

                                {/* Explanation */}
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                  {suggestion.explanation}
                                </p>

                                {/* Missing Guests */}
                                {suggestion.missingGuests && suggestion.missingGuests.length > 0 && (
                                  <div className="px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5" />
                                      Missing: {suggestion.missingGuests.join(", ")}
                                    </p>
                                  </div>
                                )}

                                {/* Select Button */}
                                <Button
                                  onClick={() => handleSelectTime(suggestion.suggestedStartTime)}
                                  className="w-200 bg-yellow-200 hover:bg-yellow-100 text-black shadow-md"
                                >
                                  Select this time
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <DashboardHeatmap
              proposedDates={proposedDates}
              guests={guests}
              respondedCount={respondedCount}
              adminSlug={adminSlug}
            />
          </Card>
        </div>
      </div>

      <aside className="hidden lg:flex w-72 border-l border-border/60 bg-background flex-col">
        <div className="p-5 border-b border-border/60">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Invitees
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {respondedCount} of {totalGuests} responded
          </p>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-1">
          {guests.length === 0 ? (
            <div className="px-3 py-4 rounded-lg border border-dashed border-border/80 bg-muted/20 text-center space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Waiting for responses... Share your guest link to get started!
              </p>
              <p className="text-xs font-mono break-all text-left text-foreground/80 bg-background rounded-md p-2 border border-border/50">
                {guestLink}
              </p>
              <Button variant="secondary" size="sm" className="w-full gap-2" onClick={copyGuestLink}>
                <Copy className="h-3.5 w-3.5" />
                Copy guest link
              </Button>
            </div>
          ) : (
            guests.map((inv) => {
              const responded = guestHasResponded(inv);
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {getInitials(inv.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.name}</p>
                  </div>
                  {responded ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default HostDashboard;
