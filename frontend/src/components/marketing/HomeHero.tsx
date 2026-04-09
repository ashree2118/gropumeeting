import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AvailabilityGrid from "@/components/AvailabilityGrid";

interface HomeHeroProps {
  onCreateMeeting: () => void;
  onSeeHowItWorks: () => void;
}

const HomeHero = ({ onCreateMeeting, onSeeHowItWorks }: HomeHeroProps) => {
  return (
    <section className="pt-24 md:pt-28 pb-14 md:pb-20 px-4 sm:px-6">
      <div className="container mx-auto text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full bg-card-yellow text-sm font-medium text-foreground"
        >
          Your group meeting scheduler
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6"
        >
          Group Meetings,
          <br />
          <span className="text-primary">Sorted. Instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 font-body leading-relaxed"
        >
          The one-link scheduler where everyone paints their availability. No back-and-forth — just share, paint, and meet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            type="button"
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20"
            onClick={onCreateMeeting}
          >
            Create a Free Meeting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button type="button" variant="outline" size="lg" className="rounded-full px-8 py-6 text-base font-semibold" onClick={onSeeHowItWorks}>
            See How It Works
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto max-w-3xl text-left"
        >
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
          <div className="relative space-y-4">
            <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Try the grid — click or drag to paint availability
            </p>
            <AvailabilityGrid />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
