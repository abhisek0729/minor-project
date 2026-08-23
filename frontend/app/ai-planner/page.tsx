"use client";

import { useState } from "react";
import {
  Bot,
  Coins,
  Loader2,
  MapPin,
  SendHorizonal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: Array<{
    name: string;
    reason: string;
    entity_type: string;
  }>;
};

const starterPrompts = [
  "Plan a 3-day trip to Pokhara under NPR 20,000",
  "Family vacation in Kathmandu with kid-friendly activities",
  "Luxury honeymoon itinerary in Nepal",
  "Budget-friendly trek itinerary with hotels and food",
];

export default function AIPlannerPage() {
  const [destination, setDestination] = useState("Pokhara");
  const [budget, setBudget] = useState("20000");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! Tell me where you want to go, your travel style, and your budget, and I will build a customized plan for you.",
    },
  ]);

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          destination: destination.trim() || undefined,
          budget: budget && Number(budget) > 0 ? Number(budget) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "AI request failed.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I could not generate an answer right now.",
        recommendations: Array.isArray(data.recommendations)
          ? data.recommendations
          : [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the AI backend.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I hit a problem while connecting to the AI service. ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Travel AI
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">Trip Planner</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
              <Bot className="h-5 w-5 text-primary" />
              <p className="font-medium">
                Ask the assistant to create your itinerary
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Destination
                </span>
                <Input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Kathmandu"
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" /> Budget
                </span>
                <Input
                  type="number"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="20000"
                />
              </label>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Example: Plan a 5-day cultural trip to Kathmandu for a couple under NPR 35,000"
                className="min-h-32 resize-none"
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !message.trim()}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Planning...
                    </>
                  ) : (
                    <>
                      Send
                      <SendHorizonal className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.role === "user"
                      ? "ml-auto max-w-[85%] border-primary/30 bg-primary/5"
                      : "mr-auto max-w-[90%] bg-muted/40"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7">
                    {item.content}
                  </p>

                  {item.recommendations && item.recommendations.length > 0 && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {item.recommendations.map((recommendation, index) => (
                        <div
                          key={`${recommendation.name}-${index}`}
                          className="rounded-xl bg-background/80 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                              {recommendation.name}
                            </span>
                            <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                              {recommendation.entity_type}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {recommendation.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
            <h2 className="text-xl font-semibold">What the AI can do</h2>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="rounded-2xl border bg-muted/40 p-4">
                <span className="mb-2 block font-medium text-foreground">
                  Smart itinerary planning
                </span>
                Build day-by-day recommendations based on your destination,
                budget, and travel style.
              </li>
              <li className="rounded-2xl border bg-muted/40 p-4">
                <span className="mb-2 block font-medium text-foreground">
                  Budget guidance
                </span>
                Estimate daily costs for stays, food, transport, and
                attractions.
              </li>
              <li className="rounded-2xl border bg-muted/40 p-4">
                <span className="mb-2 block font-medium text-foreground">
                  Local recommendations
                </span>
                Suggest hotels, restaurants, places, and guides relevant to your
                trip.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
