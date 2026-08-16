"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircleMore, SendHorizonal, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const starterReplies = [
  "Plan a 4-day Pokhara trip with hotels, food, and a local guide.",
  "Build a budget-friendly Kathmandu itinerary under NPR 18,000.",
  "Suggest family-friendly activities and comfortable stays in Chitwan.",
];

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export default function AIRobotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I can help you plan a stay, search destinations, compare food spots, and keep your travel budget in check.",
    },
  ]);

  const quickPrompts = useMemo(() => starterReplies, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "user") {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: "I can help with that. I would recommend a 3-day route with a stay near the city center, local food stops, and a lightweight budget summary for your trip.",
          },
        ]);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [isOpen, messages]);

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: value },
    ]);
    setInput("");
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="w-[min(90vw,380px)] overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-border bg-foreground px-4 py-3 text-background">
              <div className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  className="border border-white/25 bg-white/10"
                >
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"
                    alt="AI assistant"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Travel Genie</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/75">
                    AI travel agent
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-background transition hover:bg-white/15"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto bg-muted/20 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "ml-auto bg-primary text-primary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border bg-card p-3">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-border bg-muted px-2.5 py-1.5 text-[11px] text-foreground transition hover:border-primary/30"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask the AI travel planner..."
                  className="h-8 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSend();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                  aria-label="Send message"
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:scale-105"
          aria-label="Toggle AI assistant"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground ring-2 ring-background">
              AI
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
