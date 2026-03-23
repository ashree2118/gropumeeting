import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CalendarCheck, PartyPopper } from "lucide-react";
import AvailabilityGrid, {
  type AvailabilitySlot,
} from "@/components/AvailabilityGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMeeting, submitVote, type MeetingForGuest } from "@/lib/api";

const START_HOUR = 0;
const SLOT_MINUTES = 30;

/** Build a Set<"dayIdx-slotIdx"> from ISO availability records + proposedDates */
function availabilitiesToCellKeys(
  avails: { startTime: string; endTime: string }[],
  proposedDates: string[]
): Set<string> {
  const keys = new Set<string>();
  for (const a of avails) {
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    // Find which day column this belongs to
    const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const dayIdx = proposedDates.indexOf(dateStr);
    if (dayIdx === -1) continue;
    // Walk through the 30-min slots covered by this availability
    let cursor = new Date(start);
    while (cursor < end) {
      const minutesSinceMidnight = cursor.getHours() * 60 + cursor.getMinutes();
      const slotIdx = Math.floor((minutesSinceMidnight - START_HOUR * 60) / SLOT_MINUTES);
      keys.add(`${dayIdx}-${slotIdx}`);
      cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60 * 1000);
    }
  }
  return keys;
}

function localStorageKey(guestSlug: string) {
  return `gropumeeting_guest_${guestSlug}`;
}

const GuestVote = () => {
  const { guestSlug } = useParams<{ guestSlug: string }>();
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [meeting, setMeeting] = useState<MeetingForGuest | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [existingGuestId, setExistingGuestId] = useState<string | null>(null);
  const [initialSelected, setInitialSelected] = useState<Set<string> | undefined>(undefined);

  const isEditing = !!existingGuestId;

  const onAvailabilitiesChange = useCallback((slots: AvailabilitySlot[]) => {
    setAvailabilities(slots);
  }, []);

  useEffect(() => {
    if (!guestSlug) {
      setLoadingMeeting(false);
      setFetchFailed(true);
      return;
    }
    let cancelled = false;
    setLoadingMeeting(true);
    setFetchFailed(false);

    // Check localStorage for an existing guestId
    const storedGuestId = localStorage.getItem(localStorageKey(guestSlug)) ?? undefined;

    (async () => {
      try {
        const m = await getMeeting(guestSlug, storedGuestId);
        if (!cancelled) {
          setMeeting(m);
          // If server returned guest data, pre-populate
          if (m.guest) {
            setExistingGuestId(m.guest.id);
            setName(m.guest.name);
            setEmail(m.guest.email ?? "");
            if (m.proposedDates?.length && m.guest.availabilities?.length) {
              setInitialSelected(
                availabilitiesToCellKeys(m.guest.availabilities, m.proposedDates)
              );
            }
          }
        }
      } catch {
        if (!cancelled) {
          setMeeting(null);
          setFetchFailed(true);
        }
      } finally {
        if (!cancelled) setLoadingMeeting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guestSlug]);

  const handleSubmit = async () => {
    if (!guestSlug || !name.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitVote(guestSlug, {
        name: name.trim(),
        email: email.trim() || undefined,
        guestId: existingGuestId ?? undefined,
        availabilities,
      });
      // Persist guestId for future edits
      if (result.guestId) {
        localStorage.setItem(localStorageKey(guestSlug), result.guestId);
        setExistingGuestId(result.guestId);
      }
      setSuccess(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit availability");
    } finally {
      setSubmitting(false);
    }
  };

  // Unique key to force AvailabilityGrid remount when initialSelected changes
  const gridKey = useMemo(
    () => (initialSelected ? `edit-${initialSelected.size}` : "new"),
    [initialSelected]
  );

  if (loadingMeeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm">Loading meeting…</p>
        </div>
      </div>
    );
  }

  if (fetchFailed || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Meeting Not Found or Link Expired</CardTitle>
            <CardDescription>
              This link may be invalid or the meeting may no longer be available. Ask the host for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {isEditing ? "Availability Updated!" : "Thanks for voting!"}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Your availability has been sent to the host.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/40" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasDates = meeting.proposedDates.length > 0;
  const canSubmit =
    name.trim().length >= 2 && availabilities.length > 0 && !submitting;

  return (
    <div className="min-h-screen bg-muted/30 p-4 pb-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pt-8">
        <header className="space-y-2 text-center sm:text-left">
          <p className="text-sm font-medium text-primary">You&apos;re invited</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            {meeting.title}
          </h1>
          {meeting.description ? (
            <p className="text-pretty max-w-2xl text-muted-foreground">
              {meeting.description}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Duration:</span>{" "}
            {meeting.durationMinutes} minutes
          </p>
        </header>

        {!hasDates ? (
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">No dates to vote on</CardTitle>
              <CardDescription>
                The host has not proposed any days yet. Check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Your details</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update your name or email if needed."
                    : "Add your name so the host knows who submitted availability."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Name</Label>
                  <Input
                    id="guest-name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email (optional)</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <AvailabilityGrid
              key={gridKey}
              proposedDates={meeting.proposedDates}
              onAvailabilitiesChange={onAvailabilitiesChange}
              showFooterSubmit={false}
              initialSelected={initialSelected}
            />

            <div className="flex justify-center sm:justify-end">
              <Button
                size="lg"
                className="min-w-[200px]"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating…" : "Submitting…"}
                  </>
                ) : isEditing ? (
                  "Update Availability"
                ) : (
                  "Submit Availability"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuestVote;
