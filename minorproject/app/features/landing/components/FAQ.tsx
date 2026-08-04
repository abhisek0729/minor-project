"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const faqs = [
  {
    question: "What is this platform?",
    answer:
      "Our platform helps travelers discover destinations, generate AI-powered itineraries, find hotels and restaurants, and manage their trips from one place.",
  },
  {
    question: "How does the AI Trip Planner work?",
    answer:
      "Enter your destination, budget, travel dates, and preferences. Our AI generates a personalized itinerary with recommended hotels, attractions, restaurants, transportation, and estimated costs.",
  },
  {
    question: "Do I need an account to use the AI planner?",
    answer:
      "No. You can explore destinations without signing in. However, creating an account lets you save itineraries, book hotels, and receive personalized recommendations.",
  },
  {
    question: "Can I list my hotel or restaurant?",
    answer:
      "Yes. Register as a partner, complete your business profile, and submit it for verification. Once approved, your listing becomes visible to travelers.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes. We use secure authentication, encrypted communication, and follow industry best practices to protect your information.",
  },
  {
    question: "Is the platform free?",
    answer:
      "Creating an account and planning trips is free. Some premium services or bookings may include additional charges.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Frequently Asked Questions
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Have Questions?
          </h2>

          <p className="mt-4 text-muted-foreground">
            Everything you need to know about our platform.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible
              key={faq.question}
              open={open === index}
              onOpenChange={(value) =>
                setOpen(value ? index : null)
              }
              className="rounded-xl border bg-card"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left font-semibold hover:bg-muted/50">
                {faq.question}

                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    open === index ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="px-6 pb-6 text-muted-foreground leading-7">
                {faq.answer}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}