import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, CalendarDays, ArrowLeft } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { getMyMeetings, type MyMeeting } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format, isSameDay, parseISO } from "date-fns";

const GlobalDashboard = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MyMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMyMeetings();
        if (!cancelled) setMeetings(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load meetings.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matchesDate = (meeting: MyMeeting, date: Date): boolean => {
    // Check createdAt
    if (isSameDay(parseISO(meeting.createdAt), date)) return true;
    // Check proposedDates
    if (
      meeting.proposedDates?.some((d) => {
        try {
          return isSameDay(parseISO(d), date);
        } catch {
          return false;
        }
      })
    )
      return true;
    return false;
  };

  const filteredMeetings = selectedDate
    ? meetings.filter((m) => matchesDate(m, selectedDate))
    : meetings;

  // Dates that have meetings (for calendar dot indicators)
  const meetingDates = meetings.flatMap((m) => {
    const dates: Date[] = [];
    try {
      dates.push(parseISO(m.createdAt));
    } catch {
      /* ignore */
    }
    m.proposedDates?.forEach((d) => {
      try {
        dates.push(parseISO(d));
      } catch {
        /* ignore */
      }
    });
    return dates;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center pt-24">
          <Loader2
            className="h-10 w-10 animate-spin text-primary"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex min-h-screen items-center justify-center p-6 pt-24">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">
            Could not load meetings
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
        <div className="flex items-center gap-4 pb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
              My Meetings
            </h1>
            <p className="text-sm text-muted-foreground">
              {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Calendar */}
          <div className="shrink-0">
            <Card className="border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Filter by Date
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a date to filter meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  modifiers={{ hasMeeting: meetingDates }}
                  modifiersStyles={{
                    hasMeeting: {
                      fontWeight: 700,
                      textDecoration: "underline",
                      textDecorationColor: "hsl(var(--primary))",
                      textUnderlineOffset: "3px",
                    },
                  }}
                  className="rounded-lg border p-3"
                />
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs text-muted-foreground"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear filter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Meeting List */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {selectedDate
                  ? `Meetings on ${format(selectedDate, "MMM d, yyyy")}`
                  : "All Meetings"}
              </h2>
              <Badge variant="outline" className="text-xs">
                {filteredMeetings.length} result
                {filteredMeetings.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {filteredMeetings.length === 0 ? (
              <Card className="border-dashed border-border/50 rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No meetings found
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {selectedDate
                      ? "Try selecting a different date or clear the filter."
                      : "Create a new meeting to get started."}
                  </p>
                  {!selectedDate && (
                    <Button
                      size="sm"
                      className="mt-4 rounded-full font-semibold"
                      onClick={() => navigate("/create")}
                    >
                      Create Meeting
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredMeetings.map((meeting) => (
                  <Card
                    key={meeting.id}
                    className="group cursor-pointer border-border/50 shadow-sm rounded-2xl transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                    onClick={() => navigate(`/meeting/${meeting.id}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {meeting.title}
                        </h3>
                        {(() => {
                          const now = new Date();
                          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                          const allPast =
                            meeting.status !== "CONFIRMED" &&
                            Array.isArray(meeting.proposedDates) &&
                            meeting.proposedDates.length > 0 &&
                            meeting.proposedDates.every((d) => d < todayStr);
                          return allPast ? (
                            <Badge
                              variant="destructive"
                              className="shrink-0 text-[10px] uppercase tracking-wider"
                            >
                              Expired
                            </Badge>
                          ) : (
                            <Badge
                              variant={
                                meeting.status === "CONFIRMED"
                                  ? "default"
                                  : "secondary"
                              }
                              className="shrink-0 text-[10px] uppercase tracking-wider"
                            >
                              {meeting.status === "CONFIRMED"
                                ? "Confirmed"
                                : "Pending"}
                            </Badge>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {meeting.proposedDates?.length || 0} date
                          {(meeting.proposedDates?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground/70">
                        Created{" "}
                        {format(parseISO(meeting.createdAt), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GlobalDashboard;
