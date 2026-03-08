import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ScrollFadeIn from "./ScrollFadeIn";

const faqs = [
  {
    question: "Do my guests need to create an account?",
    answer:
      "Nope! They just click the link you share and vote on the times that work for them. No sign-up, no downloads — it takes seconds.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes, 100% free to use. Create unlimited group meetings, invite as many people as you want, and find the perfect time — all at zero cost.",
  },
  {
    question: "How does it handle timezones?",
    answer:
      "Meetrix Groups automatically detects each participant's timezone and converts all times accordingly. Everyone sees slots in their own local time — no mental math required.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-14 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <ScrollFadeIn className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Any questions?
              <br />
              We got you.
            </h2>
            <p className="text-muted-foreground font-body mt-6 max-w-sm leading-relaxed">
              Everything you need to know about Meetrix Groups. Can't find the answer you're looking for? Reach out to our team.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground mt-6 hover:underline w-fit"
            >
              More FAQs <span aria-hidden>→</span>
            </a>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.2}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-border py-1"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground text-base hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body text-sm leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
