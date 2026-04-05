import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarDays,
  Clock,
  PartyPopper,
  Copy,
  ExternalLink,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMeetingStore } from "@/store/useMeetingStore";
import { AppNavbar } from "@/components/AppNavbar";

// ---------- State shape (Zustand-ready) ----------
export interface MeetingFormState {
  title: string;
  description: string;
  duration: string;
  proposedDates: Date[];
}

const initialState: MeetingFormState = {
  title: "",
  description: "",
  duration: "30",
  proposedDates: [],
};

const STEPS = [
  { id: 1, label: "Basic Info", icon: CalendarDays },
  { id: 2, label: "Propose Dates", icon: Clock },
  { id: 3, label: "Share", icon: PartyPopper },
];

const DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const MeetingWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<MeetingFormState>(initialState);
  const setBasicInfo = useMeetingStore((s) => s.setBasicInfo);
  const setDates = useMeetingStore((s) => s.setDates);
  const submitMeeting = useMeetingStore((s) => s.submitMeeting);
  const guestLink = useMeetingStore((s) => s.guestLink);
  const adminLink = useMeetingStore((s) => s.adminLink);
  const isLoading = useMeetingStore((s) => s.isLoading);
  const resetStore = useMeetingStore((s) => s.resetStore);

  useEffect(() => {
    resetStore();
  }, [resetStore]);

  const updateField = <K extends keyof MeetingFormState>(
    key: K,
    value: MeetingFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    updateField("proposedDates", dates || []);
  };

  const canProceed = () => {
    if (step === 1) return formState.title.trim().length > 0;
    if (step === 2) return formState.proposedDates.length > 0;
    return true;
  };

  const shareableLink = guestLink
    ? `${window.location.origin}${guestLink}`
    : "";

  const copyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard!");
  };

  const isSuccess = step === 3;

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24 pb-12">
      <Card
        className={cn(
          "w-full border-border/50 shadow-lg transition-all rounded-2xl",
          isSuccess ? "max-w-lg" : "max-w-xl"
        )}
      >
        {/* Step indicator (hidden on success) */}
        {!isSuccess && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isComplete = step > s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "flex items-center justify-center h-9 w-9 rounded-full border-2 transition-colors shrink-0",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isComplete
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-2",
                          step > s.id ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <CardTitle className="text-lg">
              Step {step}: {STEPS[step - 1].label}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter the basic details for your meeting"}
              {step === 2 && "Select one or more days to propose to your group"}
            </CardDescription>
          </CardHeader>
        )}

        <CardContent className={cn("space-y-6", isSuccess && "pt-8")}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Q3 Planning Sprint"
                  value={formState.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What's the purpose of this meeting?"
                  rows={3}
                  value={formState.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Meeting Duration</Label>
                <Select
                  value={formState.duration}
                  onValueChange={(v) => updateField("duration", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Propose Dates */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={formState.proposedDates}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className={cn(
                    "p-3 pointer-events-auto rounded-lg border"
                  )}
                />
              </div>
              {formState.proposedDates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.proposedDates
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d) => (
                      <Badge
                        key={d.toISOString()}
                        variant="secondary"
                        className="gap-1"
                      >
                        {format(d, "EEE, MMM d")}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <PartyPopper className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Meeting Created!
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Share this link with your group so they can vote on their
                  availability.
                </p>
              </div>

              {/* Shareable link */}
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  Shareable Link
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md bg-background border text-sm font-mono text-foreground truncate">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{shareableLink}</span>
                  </div>
                  <Button onClick={copyLink} className="gap-1.5 shrink-0">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="text-left rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium text-foreground">
                    {formState.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">
                    {DURATIONS.find((d) => d.value === formState.duration)
                      ?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposed dates</span>
                  <span className="font-medium text-foreground">
                    {formState.proposedDates.length} day
                    {formState.proposedDates.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (adminLink) {
                    // adminLink is "/dashboard/<meetingId>" — extract the id
                    const meetingId = adminLink.split("/").pop();
                    navigate(`/meeting/${meetingId}`);
                  }
                }}
                disabled={!adminLink}
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Navigation (hidden on success) */}
          {!isSuccess && (
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={async () => {
                  if (step === 1) {
                    setBasicInfo(
                      formState.title.trim(),
                      formState.description,
                      Number.parseInt(formState.duration, 10) || 30
                    );
                    setStep(2);
                    return;
                  }
                  if (step === 2) {
                    setDates(
                      formState.proposedDates.map((d) =>
                        format(d, "yyyy-MM-dd")
                      )
                    );
                    const ok = await submitMeeting();
                    if (!ok) {
                      toast.error(
                        useMeetingStore.getState().error ??
                          "Failed to create meeting"
                      );
                      return;
                    }
                    setStep(3);
                  }
                }}
                disabled={!canProceed() || isLoading}
                className="gap-1"
              >
                {step === 2
                  ? isLoading
                    ? "Creating..."
                    : "Create Meeting"
                  : "Next"}
                {step === 2 ? (
                  isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default MeetingWizard;
