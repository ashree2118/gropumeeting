import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { confirmMeeting, type DashboardGuestRow } from "@/lib/api";

const START_HOUR = 8;
const END_HOUR = 18;
const SLOTS_PER_HOUR = 2;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

function formatTime(slotIndex: number) {
  const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function slotBoundsForCell(dateStr: string, slotIdx: number): { start: Date; end: Date } {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const start = new Date(y, mo - 1, d, START_HOUR, 0, 0, 0);
  start.setMinutes(start.getMinutes() + slotIdx * SLOT_MINUTES);
  const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
  return { start, end };
}

function guestCoversSlot(
  guest: DashboardGuestRow,
  slotStart: Date,
  slotEnd: Date
): boolean {
  const ss = slotStart.getTime();
  const se = slotEnd.getTime();
  return guest.availabilities.some((a) => {
    const gs = new Date(a.startTime).getTime();
    const ge = new Date(a.endTime).getTime();
    return ss < ge && se > gs;
  });
}

function buildVoteGrid(
  proposedDates: string[],
  guests: DashboardGuestRow[]
): { votes: number[][]; maxVotes: number } {
  const numDays = proposedDates.length;
  const votes: number[][] = [];
  let maxVotes = 0;
  for (let s = 0; s < TOTAL_SLOTS; s++) {
    const row: number[] = [];
    for (let d = 0; d < numDays; d++) {
      const { start, end } = slotBoundsForCell(proposedDates[d], s);
      let c = 0;
      for (const g of guests) {
        if (guestCoversSlot(g, start, end)) c += 1;
      }
      row.push(c);
      if (c > maxVotes) maxVotes = c;
    }
    votes.push(row);
  }
  return { votes, maxVotes };
}

function heatColor(votes: number, maxVotes: number): string {
  if (votes === 0) return "bg-background";
  const denom = maxVotes > 0 ? maxVotes : 1;
  const intensity = votes / denom;
  if (intensity <= 0.2) return "bg-primary/15";
  if (intensity <= 0.4) return "bg-primary/30";
  if (intensity <= 0.6) return "bg-primary/50";
  if (intensity <= 0.8) return "bg-primary/70";
  return "bg-primary/90";
}

export interface DashboardHeatmapProps {
  proposedDates: string[];
  guests: DashboardGuestRow[];
  respondedCount: number;
  adminSlug: string;
}

const DashboardHeatmap = ({
  proposedDates,
  guests,
  respondedCount,
  adminSlug,
}: DashboardHeatmapProps) => {
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    slot: number;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmMeeting = async () => {
    if (!selectedSlot) return;

    try {
      setIsConfirming(true);
      const { start, end } = slotBoundsForCell(
        normalizedDates[selectedSlot.day],
        selectedSlot.slot
      );
      const finalStartTime = start.toISOString();
      const finalEndTime = end.toISOString();
      await confirmMeeting(adminSlug, {
        finalStartTime,
        finalEndTime,
      });
      toast.success("Meeting time confirmed!");
      setSelectedSlot(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm meeting"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const normalizedDates = useMemo(
    () => proposedDates.map((d) => (typeof d === "string" ? d : String(d))),
    [proposedDates]
  );

  const columnLabels = useMemo(() => {
    return normalizedDates.map((d) =>
      format(parse(d, "yyyy-MM-dd", new Date()), "EEE MMM d")
    );
  }, [normalizedDates]);

  const columnLabelsShort = useMemo(() => {
    return normalizedDates.map((d) => format(parse(d, "yyyy-MM-dd", new Date()), "EEE"));
  }, [normalizedDates]);

  const { votes, maxVotes } = useMemo(
    () => buildVoteGrid(normalizedDates, guests),
    [normalizedDates, guests]
  );

  const numDays = normalizedDates.length;

  if (numDays === 0) {
    return (
      <>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Availability Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No proposed dates for this meeting.
          </p>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Availability Heatmap
          <span className="text-xs font-normal text-muted-foreground">
            — darker = more votes
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="select-none overflow-x-auto">
          <div
            className="grid gap-px mb-px"
            style={{
              gridTemplateColumns: `56px repeat(${numDays}, minmax(0, 1fr))`,
            }}
          >
            <div />
            {columnLabels.map((label, i) => (
              <div
                key={normalizedDates[i]}
                className="h-9 flex items-center justify-center text-xs font-semibold text-foreground"
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{columnLabelsShort[i]}</span>
              </div>
            ))}
          </div>

          <div
            className="grid gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50"
            style={{
              gridTemplateColumns: `56px repeat(${numDays}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => (
              <div key={slotIdx} className="contents">
                <div className="bg-background flex items-start justify-end pr-2 pt-0.5">
                  {slotIdx % SLOTS_PER_HOUR === 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium leading-none">
                      {formatTime(slotIdx)}
                    </span>
                  )}
                </div>
                {normalizedDates.map((_, dayIdx) => {
                  const v = votes[slotIdx][dayIdx];
                  const isSelected =
                    selectedSlot?.day === dayIdx && selectedSlot?.slot === slotIdx;
                  const isHourStart = slotIdx % SLOTS_PER_HOUR === 0;

                  return (
                    <div
                      key={`${dayIdx}-${slotIdx}`}
                      className={[
                        "h-5 cursor-pointer transition-all duration-100 relative group",
                        isHourStart ? "border-t border-border/30" : "",
                        heatColor(v, maxVotes),
                        isSelected
                          ? "ring-2 ring-primary ring-offset-1 z-10 rounded-sm"
                          : "",
                      ].join(" ")}
                      onClick={() =>
                        setSelectedSlot(
                          isSelected ? null : { day: dayIdx, slot: slotIdx }
                        )
                      }
                    >
                      {v > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-bold text-primary-foreground drop-shadow-sm">
                            {v}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <div
                key={v}
                className={`h-3 w-5 rounded-sm border border-border/30 ${heatColor(
                  Math.min(v, maxVotes),
                  Math.max(maxVotes, 1)
                )}`}
              />
            ))}
            <span>More</span>
          </div>

          {selectedSlot && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <span className="font-medium text-foreground">
                {columnLabels[selectedSlot.day]},{" "}
                {formatTime(selectedSlot.slot)}–{formatTime(selectedSlot.slot + 2)}
              </span>
              <span className="text-muted-foreground ml-2">
                — {votes[selectedSlot.slot][selectedSlot.day]} of {respondedCount}{" "}
                available
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            disabled={!selectedSlot || isConfirming}
            className="gap-2"
            onClick={handleConfirmMeeting}
          >
            {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
            {isConfirming ? "Confirming..." : "Confirm Meeting Time"}
            {!isConfirming && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default DashboardHeatmap;
