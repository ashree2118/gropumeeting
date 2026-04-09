import { Home, LayoutGrid, Plus, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (path: string) => location.pathname === path;

  const handleCreate = () => {
    if (isAuthenticated) {
      navigate("/create");
    } else {
      // scroll to login on home page
      if (location.pathname === "/") {
        document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors",
            isActive("/")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors",
            isActive("/dashboard")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>

        {/* Create (prominent) */}
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center justify-center -mt-5 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Create Meeting"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          className="flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="text-[10px] font-medium">Theme</span>
        </button>

        {/* Logout / Login */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => logout()}
            className="flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        ) : (
          <Link
            to="/"
            onClick={() => {
              setTimeout(() => {
                document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
            className="flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default BottomNavbar;
