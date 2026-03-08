import { PenLine, Link2, Grid3X3, MousePointerClick } from "lucide-react";
import ScrollFadeIn from "./ScrollFadeIn";
import { motion } from "framer-motion";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Host Creates",
    description: "Set your meeting title, pick date ranges, and customize time slots in seconds.",
    bgClass: "bg-card-pink",
    tag: "Setup",
    tagBg: "bg-card-yellow",
  },
  {
    icon: Link2,
    step: "02",
    title: "Share the Link",
    description: "One unique link is all you need. Drop it in any group chat, email, or channel.",
    bgClass: "bg-card-blue",
    tag: "Distribute",
    tagBg: "bg-card-green",
  },
  {
    icon: Grid3X3,
    step: "03",
    title: "Guests Paint",
    description: "Everyone paints their available times on a visual grid. No sign-up required.",
    bgClass: "bg-card-yellow",
    tag: "Collaborate",
    tagBg: "bg-card-pink",
  },
  {
    icon: MousePointerClick,
    step: "04",
    title: "Confirm & Meet",
    description: "See the heatmap of overlapping times. Pick the best slot and lock it in.",
    bgClass: "bg-card-green",
    tag: "Finalize",
    tagBg: "bg-card-blue",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-14 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <ScrollFadeIn className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-card-on uppercase tracking-wider bg-card-blue px-4 py-1.5 rounded-full mb-4">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Four Steps to
            <br />
            the Perfect Time.
          </h2>
        </ScrollFadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`${s.bgClass} rounded-2xl p-7 flex flex-col gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden`}
            >
              <span className="absolute top-4 right-5 text-5xl font-display font-bold text-card-on/[0.07]">
                {s.step}
              </span>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-card-on/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-card-on" />
                </div>
                <span className={`${s.tagBg} text-card-on text-xs font-semibold px-3 py-1 rounded-full`}>
                  {s.tag}
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-card-on">{s.title}</h3>
              <p className="text-sm text-card-on-muted leading-relaxed font-body">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
