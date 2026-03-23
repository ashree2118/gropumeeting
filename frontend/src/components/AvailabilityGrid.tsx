import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, RotateCcw } from "lucide-react";

const DEFAULT_DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 0;
const END_HOUR = 24;
const SLOTS_PER_HOUR = 2;
const SLOT_MINUTES = 30;
export const GRID_TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

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
}

const AvailabilityGrid = ({
  proposedDates,
  onAvailabilitiesChange,
  showFooterSubmit = true,
  initialSelected,
}: AvailabilityGridProps = {}) => {
  const [selected, setSelected] = useState<Set<CellKey>>(
    () => (initialSelected as Set<CellKey>) ?? new Set()
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [dragStart, setDragStart] = useState<{ day: number; slot: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: number; slot: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const columnLabels = useMemo(() => {
    if (proposedDates?.length) {
      return proposedDates.map((d) =>
        format(parse(d, "yyyy-MM-dd", new Date()), "EEE MMM d")
      );
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
    const mode = selected.has(key) ? "remove" : "add";
    setDragMode(mode);
    setDragStart({ day, slot });
    setDragCurrent({ day, slot });
    setIsDragging(true);
  };

  const handlePointerEnter = (day: number, slot: number) => {
    if (!isDragging) return;
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
    <Card className="w-full max-w-4xl shadow-lg border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Select Your Availability</CardTitle>
              <CardDescription>Click and drag to mark when you're free</CardDescription>
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
        <div
          ref={gridRef}
          className="select-none overflow-x-auto"
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="grid gap-px mb-px"
            style={{ gridTemplateColumns }}
          >
            <div className="h-10" />
            {columnLabels.map((label, i) => (
              <div
                key={`col-${i}`}
                className="h-10 flex items-center justify-center text-center px-1 text-xs font-semibold text-foreground sm:text-sm"
              >
                {label}
              </div>
            ))}
          </div>

          <div
            className="grid gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60 max-h-[500px] overflow-y-auto"
            style={{ gridTemplateColumns }}
          >
            {Array.from({ length: GRID_TOTAL_SLOTS }, (_, slotIdx) => (
              <div key={`slot-row-${slotIdx}`} className="contents">
                <div className="bg-background flex items-start justify-end pr-2 pt-0.5">
                  {slotIdx % SLOTS_PER_HOUR === 0 && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {formatTime(slotIdx)}
                    </span>
                  )}
                </div>
                {Array.from({ length: numDays }, (_, dayIdx) => {
                  const active = isCellActive(dayIdx, slotIdx);
                  const preview = isCellPreview(dayIdx, slotIdx);
                  const isHourStart = slotIdx % SLOTS_PER_HOUR === 0;
                  return (
                    <div
                      key={`${dayIdx}-${slotIdx}`}
                      className={[
                        "h-5 transition-colors duration-75 cursor-pointer",
                        isHourStart ? "border-t border-border/40" : "",
                        active
                          ? preview
                            ? "bg-primary/70"
                            : "bg-primary/85"
                          : preview && dragMode === "remove"
                            ? "bg-destructive/20"
                            : "bg-background hover:bg-muted/60",
                      ].join(" ")}
                      onPointerDown={() => handlePointerDown(dayIdx, slotIdx)}
                      onPointerEnter={() => handlePointerEnter(dayIdx, slotIdx)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-primary/85" />
              Available
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-background border border-border" />
              Unavailable
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
