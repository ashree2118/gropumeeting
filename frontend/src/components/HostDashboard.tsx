import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  Target,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

// --- Mock Data ---
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 18;
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

const INVITEES = [
  { name: "Alice Chen", initials: "AC", responded: true },
  { name: "Bob Martinez", initials: "BM", responded: true },
  { name: "Carol Wu", initials: "CW", responded: true },
  { name: "David Kim", initials: "DK", responded: true },
  { name: "Eva Singh", initials: "ES", responded: false },
  { name: "Frank Osei", initials: "FO", responded: true },
];

const MEETING = {
  title: "Q3 Planning Sprint",
  purpose: "Align on roadmap priorities and assign ownership for key deliverables.",
  duration: "60 min",
  responses: INVITEES.filter((i) => i.responded).length,
  total: INVITEES.length,
};

// Generate realistic mock vote data (0-5 votes per slot)
function generateVotes(): number[][] {
  const seed = 42;
  const grid: number[][] = [];
  for (let s = 0; s < TOTAL_SLOTS; s++) {
    const row: number[] = [];
    for (let d = 0; d < 5; d++) {
      // Cluster votes around mid-morning and early afternoon
      const hour = START_HOUR + s / SLOTS_PER_HOUR;
      const peakBonus =
        (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 15.5) ? 2 : 0;
      const hash = ((s * 7 + d * 13 + seed) % 11);
      const base = hash < 3 ? 0 : hash < 5 ? 1 : hash < 7 ? 2 : hash < 9 ? 3 : 4;
      row.push(Math.min(5, Math.max(0, base + (hash % 2 === 0 ? peakBonus : 0))));
    }
    grid.push(row);
  }
  return grid;
}

const VOTES = generateVotes();
const MAX_VOTES = Math.max(...VOTES.flat());

function formatTime(slotIndex: number) {
  const totalMinutes = START_HOUR * 60 + slotIndex * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function heatColor(votes: number): string {
  if (votes === 0) return "bg-background";
  const intensity = votes / MAX_VOTES;
  if (intensity <= 0.2) return "bg-primary/15";
  if (intensity <= 0.4) return "bg-primary/30";
  if (intensity <= 0.6) return "bg-primary/50";
  if (intensity <= 0.8) return "bg-primary/70";
  return "bg-primary/90";
}

const HostDashboard = () => {
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    slot: number;
  } | null>(null);

  const respondedCount = INVITEES.filter((i) => i.responded).length;

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Main content */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Meeting Summary */}
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
                  <h2 className="text-lg font-semibold text-foreground">
                    {MEETING.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <Target className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    {MEETING.purpose}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Clock className="h-3 w-3" />
                      {MEETING.duration}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Users className="h-3 w-3" />
                      {respondedCount}/{MEETING.total} responded
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Grid */}
          <Card className="border-border/50 shadow-sm">
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
                {/* Header */}
                <div className="grid grid-cols-[56px_repeat(5,1fr)] gap-px mb-px">
                  <div />
                  {DAYS_SHORT.map((day, i) => (
                    <div
                      key={day}
                      className="h-9 flex items-center justify-center text-xs font-semibold text-foreground"
                    >
                      <span className="hidden sm:inline">{DAYS[i]}</span>
                      <span className="sm:hidden">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-[56px_repeat(5,1fr)] gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
                  {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => (
                    <>
                      <div
                        key={`t-${slotIdx}`}
                        className="bg-background flex items-start justify-end pr-2 pt-0.5"
                      >
                        {slotIdx % SLOTS_PER_HOUR === 0 && (
                          <span className="text-[10px] text-muted-foreground font-medium leading-none">
                            {formatTime(slotIdx)}
                          </span>
                        )}
                      </div>
                      {DAYS.map((_, dayIdx) => {
                        const votes = VOTES[slotIdx][dayIdx];
                        const isSelected =
                          selectedSlot?.day === dayIdx &&
                          selectedSlot?.slot === slotIdx;
                        const isHourStart = slotIdx % SLOTS_PER_HOUR === 0;

                        return (
                          <div
                            key={`${dayIdx}-${slotIdx}`}
                            className={[
                              "h-5 cursor-pointer transition-all duration-100 relative group",
                              isHourStart ? "border-t border-border/30" : "",
                              heatColor(votes),
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
                            {votes > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-bold text-primary-foreground drop-shadow-sm">
                                  {votes}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={`h-3 w-5 rounded-sm border border-border/30 ${heatColor(v)}`}
                    />
                  ))}
                  <span>More</span>
                </div>

                {/* Selected slot info */}
                {selectedSlot && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <span className="font-medium text-foreground">
                      {DAYS[selectedSlot.day]},{" "}
                      {formatTime(selectedSlot.slot)}–
                      {formatTime(selectedSlot.slot + 2)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      — {VOTES[selectedSlot.slot][selectedSlot.day]} of{" "}
                      {respondedCount} available
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button size="lg" disabled={!selectedSlot} className="gap-2">
                  Confirm Meeting Time
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 border-l border-border/60 bg-background flex-col">
        <div className="p-5 border-b border-border/60">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Invitees
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {respondedCount} of {MEETING.total} responded
          </p>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-1">
          {INVITEES.map((inv) => (
            <div
              key={inv.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {inv.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {inv.name}
                </p>
              </div>
              {inv.responded ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
            </div>
          ))}
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
