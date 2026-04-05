import { CalendarDays, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";

const navLinkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

export function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const featuresHref = location.pathname === "/" ? "#features" : "/#features";
  const howHref = location.pathname === "/" ? "#how-it-works" : "/#how-it-works";
  const loginHref = location.pathname === "/" ? "#login" : "/#login";

  const handleCreateMeeting = () => {
    setMobileOpen(false);
    if (isAuthenticated) {
      navigate("/create");
      return;
    }
    if (location.pathname === "/") {
      document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <CalendarDays className="h-7 w-7 text-foreground" />
          <span className="text-xl font-display font-bold text-foreground">Meetrix Groups</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href={featuresHref} className={navLinkClass}>
            Features
          </a>
          <a href={howHref} className={navLinkClass}>
            How It Works
          </a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={navLinkClass}
              >
                Sign Out
              </button>
            </>
          ) : (
            <a href={loginHref} className={navLinkClass}>
              Log In
            </a>
          )}
          <button type="button" onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
          </button>
          <Button type="button" className="rounded-full px-6 font-semibold" onClick={handleCreateMeeting}>
            Create Meeting
          </Button>
        </div>

        <button type="button" className="md:hidden" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 flex flex-col gap-3">
          <a href={featuresHref} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href={howHref} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button type="button" onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-muted-foreground text-left">
                Sign Out
              </button>
            </>
          ) : (
            <a href={loginHref} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Log In
            </a>
          )}
          <button type="button" onClick={toggle} className="text-sm font-medium text-muted-foreground text-left flex items-center gap-2">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <Button type="button" className="rounded-full px-6 font-semibold w-fit" onClick={handleCreateMeeting}>
            Create Meeting
          </Button>
        </div>
      )}
    </nav>
  );
}
