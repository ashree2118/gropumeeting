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
} from "lucide-react";
import { toast } from "sonner";
import DashboardHeatmap from "@/components/DashboardHeatmap";
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

const HostDashboard = ({ meeting, guests, guestLink, adminSlug }: HostDashboardProps) => {
  const proposedDates = Array.isArray(meeting.proposedDates)
    ? meeting.proposedDates.map((d) => (typeof d === "string" ? d : String(d)))
    : [];

  const respondedCount = guests.filter(guestHasResponded).length;
  const totalGuests = guests.length;

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink).then(
      () => toast.success("Guest link copied"),
      () => toast.error("Could not copy link")
    );
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Host Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review responses and confirm the best time
            </p>
          </div>

          <Card className="border-border/50 shadow-sm">
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

          <Card className="border-border/50 shadow-sm">
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

        <div className="p-4 border-t border-border/60">
          <Button variant="outline" size="sm" className="w-full text-xs">
            Send Reminder
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default HostDashboard;
