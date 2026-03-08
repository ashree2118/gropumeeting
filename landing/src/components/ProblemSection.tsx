import { MessageSquareWarning, Clock, Users } from "lucide-react";
import ScrollFadeIn from "./ScrollFadeIn";
import { motion } from "framer-motion";

const problems = [
  {
    icon: MessageSquareWarning,
    title: '"When works for everyone?"',
    description: "Endless group chats trying to find one time that fits. By the time you agree, the week is over.",
    bgClass: "bg-card-yellow",
    tagBg: "bg-card-blue",
    tag: "Communication",
  },
  {
    icon: Clock,
    title: "Timezone Nightmares",
    description: "Half your group is in another timezone. Manually converting hours leads to missed meetings and frustration.",
    bgClass: "bg-card-pink",
    tagBg: "bg-card-green",
    tag: "Timezones",
  },
  {
    icon: Users,
    title: "Too Many Cooks",
    description: "Polls, spreadsheets, reply-all threads — the more people involved, the messier it gets.",
    bgClass: "bg-card-green",
    tagBg: "bg-card-yellow",
    tag: "Coordination",
  },
];

const ProblemSection = () => {
  return (
    <section id="features" className="py-14 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <ScrollFadeIn className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-card-on uppercase tracking-wider bg-card-pink px-4 py-1.5 rounded-full mb-4">The Problem</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Stop the Scheduling
            <br />
            Ping-Pong.
          </h2>
        </ScrollFadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`${problem.bgClass} rounded-2xl p-8 flex flex-col gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-card-on/10 flex items-center justify-center">
                  <problem.icon className="h-6 w-6 text-card-on" />
                </div>
                <span className={`${problem.tagBg} text-card-on text-xs font-semibold px-3 py-1 rounded-full`}>
                  {problem.tag}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-card-on">{problem.title}</h3>
              <p className="text-sm text-card-on-muted leading-relaxed font-body">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
