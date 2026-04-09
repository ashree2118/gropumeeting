import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-border py-8 md:py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <img
            src={theme === "dark" ? "/logo_darktheme.svg" : "/logo_lighttheme.svg"}
            alt="Meetrix Groups logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-display font-bold text-foreground">Meetrix Groups</span>
        </Link>
            
          </div>

          <div className="flex items-center gap-6">
            <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
          </div>

          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Meetrix Groups. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
