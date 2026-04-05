import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-5xl font-display font-bold text-foreground">404</h1>
          <p className="text-lg text-muted-foreground font-body">Oops! Page not found</p>
          <Button asChild className="rounded-full font-semibold mt-4">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
