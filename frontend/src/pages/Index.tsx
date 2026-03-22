import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import AvailabilityGrid from "@/components/AvailabilityGrid";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const Index = () => {
  const navigate = useNavigate();
  const loginAnchorRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleHeroCreateMeeting = () => {
    if (isAuthenticated) {
      navigate("/create");
      return;
    }
    loginAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Gropumeeting
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button size="sm" onClick={() => navigate("/create")}>
                  Create Meeting
                </Button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div ref={loginAnchorRef} className="flex shrink-0 items-center">
                <GoogleLoginButton />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 p-4">
        <section className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Find a time that works for everyone
          </h1>
          <p className="text-pretty text-muted-foreground">
            Share availability and schedule group meetings without the back-and-forth.
          </p>
          <Button size="lg" className="mt-2" onClick={handleHeroCreateMeeting}>
            Create Meeting
          </Button>
        </section>

        <AvailabilityGrid />
      </main>
    </div>
  );
};

export default Index;
