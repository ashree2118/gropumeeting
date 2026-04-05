import ScrollFadeIn from "./ScrollFadeIn";
import { motion } from "framer-motion";

const tags = [
  { label: "Remote Startup Teams", bg: "bg-card-green" },
  { label: "D&D Campaigns", bg: "bg-card-pink" },
  { label: "University Study Groups", bg: "bg-card-blue" },
  { label: "Family Reunions", bg: "bg-card-yellow" },
  { label: "Board Meetings", bg: "bg-card-green" },
  { label: "Gaming Clans", bg: "bg-card-pink" },
  { label: "Book Clubs", bg: "bg-card-blue" },
  { label: "Freelancer Syncs", bg: "bg-card-yellow" },
  { label: "Hackathon Teams", bg: "bg-card-green" },
  { label: "Wedding Planning", bg: "bg-card-pink" },
  { label: "Sports Leagues", bg: "bg-card-blue" },
  { label: "Church Groups", bg: "bg-card-yellow" },
];

const PerfectForSection = () => {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <ScrollFadeIn>
          <span className="inline-block text-sm font-semibold text-card-on uppercase tracking-wider bg-card-green px-4 py-1.5 rounded-full mb-4">
            Use Cases
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mt-3 mb-8 md:mb-12">
            Perfect For Every
            <br />
            Group.
          </h2>
        </ScrollFadeIn>

        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`${tag.bg} text-card-on font-semibold text-sm md:text-base px-5 py-2.5 rounded-full cursor-default transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:scale-105`}
            >
              {tag.label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerfectForSection;
