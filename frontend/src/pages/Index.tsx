import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import HomeHero from "@/components/marketing/HomeHero";
import ProblemSection from "@/components/marketing/ProblemSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import PerfectForSection from "@/components/marketing/PerfectForSection";
import FaqSection from "@/components/marketing/FaqSection";
import HomeCta from "@/components/marketing/HomeCta";
import Footer from "@/components/marketing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAnchorRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleCreateMeeting = () => {
    if (isAuthenticated) {
      navigate("/create");
      return;
    }
    loginAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleSeeHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useLayoutEffect(() => {
    const { hash, pathname } = location;
    if (pathname !== "/" || !hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <HomeHero onCreateMeeting={handleCreateMeeting} onSeeHowItWorks={handleSeeHowItWorks} />

      <section
        id="login"
        ref={loginAnchorRef}
        className="py-12 md:py-16 px-4 sm:px-6 scroll-mt-24"
      >
        <div className="container mx-auto max-w-lg">
          <div className="rounded-2xl border border-border bg-card-blue/40 dark:bg-card-blue/20 p-8 md:p-10 text-center space-y-4">
            <span className="inline-block text-xs font-semibold text-card-on uppercase tracking-wider bg-background/80 px-3 py-1 rounded-full">
              Hosts
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Sign in to create meetings
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Connect Google Calendar so we can propose times that respect your busy slots.
            </p>
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button className="rounded-full font-semibold" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="rounded-full font-semibold" onClick={() => navigate("/create")}>
                  Create Meeting
                </Button>
              </div>
            ) : (
              <div className="pt-2 flex justify-center">
                <div className="w-full max-w-sm">
                  <GoogleLoginButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ProblemSection />
      <HowItWorksSection />
      <PerfectForSection />
      <FaqSection />
      <HomeCta onCreateMeeting={handleCreateMeeting} />
      <Footer />
    </div>
  );
};

export default Index;
