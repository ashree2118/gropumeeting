import { CalendarDays, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-foreground" />
          <span className="text-xl font-display font-bold text-foreground">Meetrix Groups</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log In</a>
          <button onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition-colors">
            {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
          </button>
          <Button className="rounded-full px-6 font-semibold">Create Meeting</Button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 flex flex-col gap-3">
          <a href="#features" className="text-sm font-medium text-muted-foreground">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground">How It Works</a>
          <a href="#" className="text-sm font-medium text-muted-foreground">Log In</a>
          <button onClick={toggle} className="text-sm font-medium text-muted-foreground text-left flex items-center gap-2">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <Button className="rounded-full px-6 font-semibold w-fit">Create Meeting</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
