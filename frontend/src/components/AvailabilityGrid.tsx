import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, RotateCcw } from "lucide-react";

const DEFAULT_DAY_LABELS = ["M", "T", "W", "T", "F"];
const START_HOUR = 0;
const END_HOUR = 24;
const SLOTS_PER_HOUR = 2;
const SLOT_MINUTES = 30;
export const GRID_TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
/** Number of half-hour slots in AM (12:00 AM → 11:30 AM = 24 slots) */
const AM_SLOTS = 12 * SLOTS_PER_HOUR;

function formatTime(slotIndex: number) {
  const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export type AvailabilitySlot = { startTime: string; endTime: string };

type CellKey = `${number}-${number}`;

function selectedCellsToAvailabilities(
  selected: Set<CellKey>,
  proposedDates: string[]
): AvailabilitySlot[] {
  const slotMs = SLOT_MINUTES * 60 * 1000;
  const slots: { start: Date; end: Date }[] = [];
  selected.forEach((key) => {
    const [dayStr, slotStr] = key.split("-");
    const dayIdx = Number(dayStr);
    const slotIdx = Number(slotStr);
    const dateStr = proposedDates[dayIdx];
    if (!dateStr) return;
    const [y, mo, d] = dateStr.split("-").map(Number);
    const start = new Date(y, mo - 1, d, START_HOUR, 0, 0, 0);
    start.setMinutes(start.getMinutes() + slotIdx * SLOT_MINUTES);
    const end = new Date(start.getTime() + slotMs);
    slots.push({ start, end });
  });
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [];
  for (const s of slots) {
    const last = merged[merged.length - 1];
    if (last && last.end.getTime() === s.start.getTime()) {
      last.end = s.end;
    } else {
      merged.push({ start: s.start, end: s.end });
    }
  }
  return merged.map((x) => ({
    startTime: x.start.toISOString(),
    endTime: x.end.toISOString(),
  }));
}

export interface AvailabilityGridProps {
  /** When set, columns match these calendar dates (`yyyy-MM-dd`); otherwise Mon–Fri placeholders. */
  proposedDates?: string[];
  onAvailabilitiesChange?: (availabilities: AvailabilitySlot[]) => void;
  /** Hide the built-in submit row (e.g. when parent provides the submit button). */
  showFooterSubmit?: boolean;
  /** Pre-populate selected cells (e.g. when editing an existing vote). Keys are "dayIdx-slotIdx". */
  initialSelected?: Set<string>;
  /** Host's busy times from Google Calendar — cells overlapping these are blocked. */
  hostBusyTimes?: { start: string; end: string }[];
}

/** Convert hostBusyTimes into a Set<CellKey> for O(1) lookups. */
function buildBusyCellSet(
  busyTimes: { start: string; end: string }[],
  proposedDates: string[]
): Set<CellKey> {
  const keys = new Set<CellKey>();
  for (const block of busyTimes) {
    const bStart = new Date(block.start).getTime();
    const bEnd = new Date(block.end).getTime();
    // Walk every proposed date + every slot and check overlap
    for (let dayIdx = 0; dayIdx < proposedDates.length; dayIdx++) {
      const [y, mo, d] = proposedDates[dayIdx].split("-").map(Number);
      for (let slotIdx = 0; slotIdx < GRID_TOTAL_SLOTS; slotIdx++) {
        const slotStart = new Date(y, mo - 1, d, START_HOUR, slotIdx * SLOT_MINUTES).getTime();
        const slotEnd = slotStart + SLOT_MINUTES * 60 * 1000;
        // Overlap: slotStart < bEnd && slotEnd > bStart
        if (slotStart < bEnd && slotEnd > bStart) {
          keys.add(`${dayIdx}-${slotIdx}`);
        }
      }
    }
  }
  return keys;
}

function buildPastCellSet(proposedDates: string[]): Set<CellKey> {
  const keys = new Set<CellKey>();
  const now = Date.now();
  for (let dayIdx = 0; dayIdx < proposedDates.length; dayIdx++) {
    const [y, mo, d] = proposedDates[dayIdx].split("-").map(Number);
    for (let slotIdx = 0; slotIdx < GRID_TOTAL_SLOTS; slotIdx++) {
      const slotEnd = new Date(y, mo - 1, d, START_HOUR, slotIdx * SLOT_MINUTES + SLOT_MINUTES).getTime();
      if (slotEnd <= now) {
        keys.add(`${dayIdx}-${slotIdx}`);
      }
    }
  }
  return keys;
}

const AvailabilityGrid = ({
  proposedDates,
  onAvailabilitiesChange,
  showFooterSubmit = true,
  initialSelected,
  hostBusyTimes = [],
}: AvailabilityGridProps = {}) => {
  const [selected, setSelected] = useState<Set<CellKey>>(
    () => (initialSelected as Set<CellKey>) ?? new Set()
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [dragStart, setDragStart] = useState<{ day: number; slot: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: number; slot: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const busyCells = useMemo(
    () => buildBusyCellSet(hostBusyTimes, proposedDates ?? []),
    [hostBusyTimes, proposedDates]
  );

  const pastCells = useMemo(
    () => buildPastCellSet(proposedDates ?? []),
    [proposedDates]
  );

  const columnLabels = useMemo(() => {
    if (proposedDates?.length) {
      // Short mobile-friendly labels: "M 7", "Tu 8", etc.
      const SHORT_DAYS: Record<string, string> = {
        Mon: "M", Tue: "Tu", Wed: "W", Thu: "Th", Fri: "F", Sat: "Sa", Sun: "Su",
      };
      return proposedDates.map((d) => {
        const date = parse(d, "yyyy-MM-dd", new Date());
        const dayAbbr = SHORT_DAYS[format(date, "EEE")] ?? format(date, "EEE");
        return `${dayAbbr} ${format(date, "d")}`;
      });
    }
    return DEFAULT_DAY_LABELS;
  }, [proposedDates]);

  const numDays = proposedDates?.length ? proposedDates.length : DEFAULT_DAY_LABELS.length;

  const gridTemplateColumns = `60px repeat(${numDays}, minmax(0, 1fr))`;

  useEffect(() => {
    if (!onAvailabilitiesChange || !proposedDates?.length) return;
    onAvailabilitiesChange(selectedCellsToAvailabilities(selected, proposedDates));
  }, [selected, proposedDates, onAvailabilitiesChange]);

  const getDragRange = useCallback(() => {
    if (!dragStart || !dragCurrent) return new Set<CellKey>();
    const minDay = Math.min(dragStart.day, dragCurrent.day);
    const maxDay = Math.max(dragStart.day, dragCurrent.day);
    const minSlot = Math.min(dragStart.slot, dragCurrent.slot);
    const maxSlot = Math.max(dragStart.slot, dragCurrent.slot);
    const cells = new Set<CellKey>();
    for (let d = minDay; d <= maxDay; d++) {
      for (let s = minSlot; s <= maxSlot; s++) {
        cells.add(`${d}-${s}`);
      }
    }
    return cells;
  }, [dragStart, dragCurrent]);

  const handlePointerDown = (day: number, slot: number) => {
    const key: CellKey = `${day}-${slot}`;
    if (busyCells.has(key) || pastCells.has(key)) return;
    const mode = selected.has(key) ? "remove" : "add";
    setDragMode(mode);
    setDragStart({ day, slot });
    setDragCurrent({ day, slot });
    setIsDragging(true);
  };

  const handlePointerEnter = (day: number, slot: number) => {
    if (!isDragging) return;
    const key: CellKey = `${day}-${slot}`;
    if (busyCells.has(key) || pastCells.has(key)) return;
    setDragCurrent({ day, slot });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    const range = getDragRange();
    setSelected((prev) => {
      const next = new Set(prev);
      range.forEach((key) => {
        if (dragMode === "add") next.add(key);
        else next.delete(key);
      });
      return next;
    });
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const dragRange = getDragRange();

  const isCellActive = (day: number, slot: number) => {
    const key: CellKey = `${day}-${slot}`;
    const inRange = dragRange.has(key);
    if (isDragging && inRange) {
      return dragMode === "add" ? true : false;
    }
    return selected.has(key);
  };

  const isCellPreview = (day: number, slot: number) => {
    const key: CellKey = `${day}-${slot}`;
    return isDragging && dragRange.has(key);
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg border-border/50 rounded-2xl bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Select Your Availability</CardTitle>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(new Set())}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend — moved to top */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-primary/85" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-background border border-border" />
            Unavailable
          </div>
          {pastCells.size > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-muted/40 opacity-40 border border-border" />
              Past
            </div>
          )}
          {hostBusyTimes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-destructive/15 opacity-50 border border-destructive/30" />
              Host busy
            </div>
          )}
        </div>

        {/* AM / PM split grid */}
        <div
          ref={gridRef}
          className="select-none"
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* ---- AM Panel ---- */}
            <div className="overflow-x-auto">
              {/* Column headers */}
              <div
                className="grid gap-px mb-px"
                style={{ gridTemplateColumns }}
              >
                <div className="h-10" />
                {columnLabels.map((label, i) => (
                  <div
                    key={`am-col-${i}`}
                    className="h-10 flex items-center justify-center text-center px-1 text-xs font-semibold text-foreground sm:text-sm"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* AM rows: slots 0–23 (12:00 AM – 11:30 AM) */}
              <div
                className="grid gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60"
                style={{ gridTemplateColumns }}
              >
                {Array.from({ length: AM_SLOTS }, (_, slotIdx) => (
                  <div key={`am-row-${slotIdx}`} className="contents">
                    <div className="bg-background flex items-start justify-end pr-2 pt-0.5">
                      {slotIdx % SLOTS_PER_HOUR === 0 && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {formatTime(slotIdx)}
                        </span>
                      )}
                    </div>
                    {Array.from({ length: numDays }, (_, dayIdx) => {
                      const cellKey: CellKey = `${dayIdx}-${slotIdx}`;
                      const busy = busyCells.has(cellKey);
                      const past = pastCells.has(cellKey);
                      const active = isCellActive(dayIdx, slotIdx);
                      const preview = isCellPreview(dayIdx, slotIdx);
                      const isHourStart = slotIdx % SLOTS_PER_HOUR === 0;
                      return (
                        <div
                          key={cellKey}
                          className={[
                            "h-5 transition-colors duration-75",
                            isHourStart ? "border-t border-border/40" : "",
                            past
                              ? "bg-muted/40 cursor-not-allowed opacity-40"
                              : busy
                                ? "bg-destructive/15 cursor-not-allowed opacity-50"
                                : active
                                  ? preview
                                    ? "bg-primary/70 cursor-pointer"
                                    : "bg-primary/85 cursor-pointer"
                                  : preview && dragMode === "remove"
                                    ? "bg-destructive/20 cursor-pointer"
                                    : "bg-background hover:bg-muted/60 cursor-pointer",
                          ].join(" ")}
                          style={
                            busy && !past
                              ? {
                                  backgroundImage:
                                    "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(239,68,68,0.12) 3px, rgba(239,68,68,0.12) 5px)",
                                }
                              : undefined
                          }
                          title={past ? "Past" : busy ? "Host is busy" : undefined}
                          onPointerDown={() => handlePointerDown(dayIdx, slotIdx)}
                          onPointerEnter={() => handlePointerEnter(dayIdx, slotIdx)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* ---- PM Panel ---- */}
            <div className="overflow-x-auto">
              {/* Column headers */}
              <div
                className="grid gap-px mb-px"
                style={{ gridTemplateColumns }}
              >
                <div className="h-10" />
                {columnLabels.map((label, i) => (
                  <div
                    key={`pm-col-${i}`}
                    className="h-10 flex items-center justify-center text-center px-1 text-xs font-semibold text-foreground sm:text-sm"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* PM rows: slots 24–47 (12:00 PM – 11:30 PM) */}
              <div
                className="grid gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60"
                style={{ gridTemplateColumns }}
              >
                {Array.from({ length: GRID_TOTAL_SLOTS - AM_SLOTS }, (_, i) => {
                  const slotIdx = AM_SLOTS + i;
                  return (
                    <div key={`pm-row-${slotIdx}`} className="contents">
                      <div className="bg-background flex items-start justify-end pr-2 pt-0.5">
                        {slotIdx % SLOTS_PER_HOUR === 0 && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {formatTime(slotIdx)}
                          </span>
                        )}
                      </div>
                      {Array.from({ length: numDays }, (_, dayIdx) => {
                        const cellKey: CellKey = `${dayIdx}-${slotIdx}`;
                        const busy = busyCells.has(cellKey);
                        const past = pastCells.has(cellKey);
                        const active = isCellActive(dayIdx, slotIdx);
                        const preview = isCellPreview(dayIdx, slotIdx);
                        const isHourStart = slotIdx % SLOTS_PER_HOUR === 0;
                        return (
                          <div
                            key={cellKey}
                            className={[
                              "h-5 transition-colors duration-75",
                              isHourStart ? "border-t border-border/40" : "",
                              past
                                ? "bg-muted/40 cursor-not-allowed opacity-40"
                                : busy
                                  ? "bg-destructive/15 cursor-not-allowed opacity-50"
                                  : active
                                    ? preview
                                      ? "bg-primary/70 cursor-pointer"
                                      : "bg-primary/85 cursor-pointer"
                                    : preview && dragMode === "remove"
                                      ? "bg-destructive/20 cursor-pointer"
                                      : "bg-background hover:bg-muted/60 cursor-pointer",
                            ].join(" ")}
                            style={
                              busy && !past
                                ? {
                                    backgroundImage:
                                      "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(239,68,68,0.12) 3px, rgba(239,68,68,0.12) 5px)",
                                  }
                                : undefined
                            }
                            title={past ? "Past" : busy ? "Host is busy" : undefined}
                            onPointerDown={() => handlePointerDown(dayIdx, slotIdx)}
                            onPointerEnter={() => handlePointerEnter(dayIdx, slotIdx)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showFooterSubmit && (
          <div className="mt-6 flex justify-end">
            <Button size="lg" disabled={selected.size === 0}>
              Submit Availability
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityGrid;
