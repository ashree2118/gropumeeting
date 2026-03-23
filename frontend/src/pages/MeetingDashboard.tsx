import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getDashboardData, type DashboardData } from "@/lib/api";
import HostDashboard from "@/components/HostDashboard";

const MeetingDashboard = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<DashboardData["meeting"] | null>(null);
  const [guests, setGuests] = useState<DashboardData["guests"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setError("Missing meeting id in the URL.");
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDashboardData(meetingId);
        if (!cancelled) {
          setMeeting(data.meeting);
          setGuests(data.guests);
        }
      } catch (e) {
        if (!cancelled) {
          setMeeting(null);
          setGuests([]);
          setError(e instanceof Error ? e.message : "Failed to load dashboard.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md rounded-lg border border-border bg-background p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">Could not load dashboard</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  const guestLink = `${window.location.origin}/m/${meeting.guestSlug}`;

  return (
    <HostDashboard
      meeting={meeting}
      guests={guests}
      guestLink={guestLink}
      adminSlug={meetingId}
    />
  );
};

export default MeetingDashboard;
