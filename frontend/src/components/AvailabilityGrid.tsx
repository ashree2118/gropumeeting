import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, RotateCcw } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8;
const END_HOUR = 18;
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

function formatTime(slotIndex: number) {
  const totalMinutes = (START_HOUR * 60) + slotIndex * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type CellKey = `${number}-${number}`;

const AvailabilityGrid = () => {
  const [selected, setSelected] = useState<Set<CellKey>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [dragStart, setDragStart] = useState<{ day: number; slot: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: number; slot: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
          {/* Header row */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-px mb-px">
            <div className="h-10" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-sm font-semibold text-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-px bg-border/60 rounded-lg overflow-hidden border border-border/60">
            {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => (
              <>
                {/* Time label */}
                <div
                  key={`time-${slotIdx}`}
                  className="bg-background flex items-start justify-end pr-2 pt-0.5"
                >
                  {slotIdx % SLOTS_PER_HOUR === 0 && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {formatTime(slotIdx)}
                    </span>
                  )}
                </div>

                {/* Day cells */}
                {DAYS.map((_, dayIdx) => {
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
              </>
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

        <div className="mt-6 flex justify-end">
          <Button size="lg" disabled={selected.size === 0}>
            Submit Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityGrid;
