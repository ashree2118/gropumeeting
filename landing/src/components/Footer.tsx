import { CalendarDays } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 md:py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-foreground" />
            <span className="text-lg font-display font-bold text-foreground">
              Meetrix Groups
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Meetrix Groups. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
