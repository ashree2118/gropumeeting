import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollFadeIn from "./ScrollFadeIn";

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <ScrollFadeIn>
        <div className="container mx-auto max-w-3xl text-center bg-card-green rounded-2xl md:rounded-3xl py-10 md:py-16 px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-card-on mb-4 md:mb-6">
            Plan less.
            <br />
            <span className="text-card-on">Meet more.</span>
          </h2>
          <p className="text-lg text-card-on-muted mb-10 max-w-xl mx-auto font-body">
            No sign-up walls. No credit card. Just share a link and let everyone paint their time.
          </p>
          <Button
            size="lg"
            className="rounded-full px-6 sm:px-10 py-5 sm:py-7 text-sm sm:text-lg font-semibold shadow-xl shadow-primary/20"
          >
            Create Your First Group Meeting for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </ScrollFadeIn>
    </section>
  );
};

export default CtaSection;
