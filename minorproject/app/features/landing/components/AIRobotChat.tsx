"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  CreditCard,
  ExternalLink,
  Globe,
  Hotel,
  ListOrdered,
  Loader2,
  Lock,
  LogIn,
  Map,
  MapPin,
  Maximize2,
  MessageCircleMore,
  Minimize2,
  PlusCircle,
  Search,
  SendHorizonal,
  ShieldAlert,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  executeAgentAction,
  type AgentProposalPayload,
} from "@/app/features/ai/actions/agent-action";

const starterReplies = [
  "Log an expense of NPR 2500 for dinner in Pokhara",
  "What are budget hotels and places to visit in Pokhara?",
  "Find top Thakali restaurants with Google Maps location",
  "Add a Deluxe Room 302 with price 4000 to my hotel",
];

type Recommendation = {
  entity_type: string;
  entity_id: number;
  name: string;
  reason: string;
  location?: string;
  map_url?: string;
  booking_note?: string;
};

type MapCard = {
  title: string;
  location: string;
  map_url: string;
  place_type: string;
};

type ActionProposal = {
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, any>;
  status?: "requires_approval" | "executing" | "executed" | "cancelled";
  resultMessage?: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  recommendations?: Recommendation[];
  action_proposal?: ActionProposal;
  map_cards?: MapCard[];
  map_url?: string;
  steps_taken?: string[];
  tools_used?: string[];
};

export default function AIRobotChat() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("Searching platform database...");
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [expandedStepsId, setExpandedStepsId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! 🙏 I am your TravelNepal AI Agent. I query our verified catalog, search live web data when needed, generate Google Maps links, and automate form filling with Human-In-The-Loop approval!",
    },
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, executingActionId, isExpanded]);

  // Listen for open-ai-chat custom events from cards & buttons
  useEffect(() => {
    const handleOpenAIChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.message) {
        setTimeout(() => {
          handleSend(e.detail.message);
        }, 100);
      }
    };
    window.addEventListener("open-ai-chat", handleOpenAIChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenAIChat);
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: query },
    ]);
    setInput("");
    setIsLoading(true);
    setCurrentStep("1. Searching TravelNepal verified database...");

    const stepTimer = setTimeout(() => {
      setCurrentStep("2. Checking web insights & generating Google Maps links...");
    }, 1200);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-12).map((m) => ({
            role: m.role,
            content: m.text,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text:
              data.detail ||
              data.error ||
              "Sorry, I had trouble answering that. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.answer || "Here is what I found for your trip:",
          recommendations: data.recommendations || [],
          action_proposal: data.action_proposal || undefined,
          map_cards: data.map_cards || [],
          map_url: data.map_url || undefined,
          steps_taken: data.steps_taken || [],
          tools_used: data.tools_used || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "Unable to connect to the AI assistant service right now. Please check if the server is running.",
        },
      ]);
    } finally {
      clearTimeout(stepTimer);
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, proposal: ActionProposal) => {
    setExecutingActionId(msgId);

    try {
      const res = await executeAgentAction(proposal);

      if (res.success) {
        toast.success(res.message);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === msgId && msg.action_proposal) {
              return {
                ...msg,
                action_proposal: {
                  ...msg.action_proposal,
                  status: "executed",
                  resultMessage: res.message,
                },
              };
            }
            return msg;
          })
        );
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute action.");
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.action_proposal) {
          return {
            ...msg,
            action_proposal: {
              ...msg.action_proposal,
              status: "cancelled",
            },
          };
        }
        return msg;
      })
    );
    toast.info("Proposed action cancelled.");
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {isOpen && (
          <div
            className={`pointer-events-auto flex flex-col overflow-hidden rounded-[26px] border border-border bg-card shadow-[0_24px_90px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out ${
              isExpanded
                ? "w-[min(96vw,920px)] h-[min(90vh,760px)]"
                : "w-[min(95vw,460px)] h-[min(85vh,600px)]"
            }`}
          >
            {/* Chat Window Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center text-primary-foreground backdrop-blur-sm">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold leading-none">Travel Genie AI</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/40 text-white">
                      RAG + HITL
                    </Badge>
                  </div>
                  <p className="text-[11px] text-primary-foreground/80 mt-0.5">
                    Platform Catalog • Live Maps • Web Search
                  </p>
                </div>
              </div>

              {/* Window Controls (Enlarge & Close) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground transition hover:bg-white/20 cursor-pointer"
                  title={isExpanded ? "Restore standard size" : "Enlarge window"}
                  aria-label={isExpanded ? "Restore standard size" : "Enlarge window"}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground transition hover:bg-white/20 cursor-pointer"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto bg-muted/20 p-4 space-y-4">
              {/* If User is NOT authenticated, show RBAC Lock Card */}
              {!isAuthenticated && status !== "loading" ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Lock className="size-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 className="font-bold text-base">Sign In Required</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      AI queries, web search, Google Maps routing, and form actions are protected with role-based access. Please sign in to continue.
                    </p>
                  </div>
                  <Link href="/sign-in">
                    <Button className="font-semibold gap-2 px-6">
                      <LogIn className="size-4" /> Sign In to Continue
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.role === "assistant" ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                          isExpanded ? "max-w-[85%]" : "max-w-[92%]"
                        } ${
                          message.role === "assistant"
                            ? "bg-card text-card-foreground shadow-xs border"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {/* Thinking Steps Accordion (If Present) */}
                        {message.steps_taken && message.steps_taken.length > 0 && (
                          <div className="mb-2.5 rounded-xl border bg-muted/50 p-2.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStepsId((prev) =>
                                  prev === message.id ? null : message.id
                                )
                              }
                              className="flex items-center justify-between w-full font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-primary">
                                <Search className="size-3" />
                                {message.steps_taken.length} search & execution steps taken
                              </span>
                              {expandedStepsId === message.id ? (
                                <ChevronUp className="size-3.5" />
                              ) : (
                                <ChevronDown className="size-3.5" />
                              )}
                            </button>

                            {expandedStepsId === message.id && (
                              <div className="mt-2 pt-2 border-t space-y-1 text-[11px] text-muted-foreground">
                                {message.steps_taken.map((step, idx) => (
                                  <p key={idx} className="flex items-center gap-1.5 leading-tight">
                                    <span className="text-primary font-bold">•</span> {step}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="whitespace-pre-line">{message.text}</div>

                        {/* LIVE GOOGLE MAPS CARDS */}
                        {message.map_cards && message.map_cards.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-border/50 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Map className="size-3 text-primary" /> Live Google Maps Navigation:
                            </p>
                            <div
                              className={`grid gap-2 ${
                                isExpanded ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
                              }`}
                            >
                              {message.map_cards.map((mapItem, idx) => (
                                <a
                                  key={idx}
                                  href={mapItem.map_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between gap-2 rounded-xl border bg-background/80 px-3 py-2 text-xs transition hover:border-primary hover:bg-primary/5 cursor-pointer shadow-2xs"
                                >
                                  <div className="truncate">
                                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                      📍 {mapItem.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {mapItem.location}
                                    </p>
                                  </div>
                                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* HITL ACTION PROPOSAL CARD */}
                        {message.action_proposal && (
                          <div className="mt-3.5 pt-3 border-t border-border/60">
                            {message.action_proposal.status === "executed" ? (
                              /* Executed State */
                              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1.5 text-emerald-800 dark:text-emerald-300">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Action Executed Successfully!</span>
                                </div>
                                <p className="text-[11px] leading-snug">
                                  {message.action_proposal.resultMessage ||
                                    "Changes have been committed to the platform."}
                                </p>
                              </div>
                            ) : message.action_proposal.status === "cancelled" ? (
                              /* Cancelled State */
                              <div className="rounded-xl border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                                ❌ Action proposal cancelled.
                              </div>
                            ) : (
                              /* Awaiting Approval Card */
                              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                    <Sparkles className="size-3.5" />
                                    <span>{message.action_proposal.title}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[9px] border-primary/40 text-primary">
                                    Needs Approval
                                  </Badge>
                                </div>

                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {message.action_proposal.description}
                                </p>

                                {/* Key-Value Details */}
                                <div className="rounded-lg bg-background/80 p-2.5 border text-[11px] space-y-1">
                                  {Object.entries(message.action_proposal.payload).map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center capitalize">
                                      <span className="text-muted-foreground">{k.replace(/_/g, " ")}:</span>
                                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                                        {typeof v === "number" && (k.includes("price") || k === "amount")
                                          ? `NPR ${v.toLocaleString()}`
                                          : String(v)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    className="flex-1 text-xs h-8 font-semibold shadow-xs cursor-pointer"
                                    disabled={executingActionId === message.id}
                                    onClick={() =>
                                      handleConfirmAction(message.id, message.action_proposal!)
                                    }
                                  >
                                    {executingActionId === message.id ? (
                                      <>
                                        <Loader2 className="size-3.5 animate-spin mr-1.5" /> Executing...
                                      </>
                                    ) : (
                                      "Confirm & Execute ✓"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 cursor-pointer"
                                    disabled={executingActionId === message.id}
                                    onClick={() => handleCancelAction(message.id)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Structured Recommendations Cards */}
                        {message.recommendations && message.recommendations.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-border/50 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Platform Recommendations:
                            </p>
                            <div
                              className={`grid gap-2 ${
                                isExpanded ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                              }`}
                            >
                              {message.recommendations.map((rec) => (
                                <div
                                  key={`${rec.entity_type}-${rec.entity_id}`}
                                  className="rounded-xl border bg-muted/40 p-2.5 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground truncate">
                                      {rec.entity_type === "hotel" ? "🏨 " : rec.entity_type === "restaurant" ? "🍽️ " : "🧭 "}
                                      {rec.name}
                                    </span>
                                    {rec.location && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                        <MapPin className="size-2.5" /> {rec.location}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-tight">
                                    {rec.reason}
                                  </p>
                                  {rec.booking_note && (
                                    <p className="text-[10px] text-primary font-medium">
                                      {rec.booking_note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Realtime Live Step Indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2.5 rounded-2xl border bg-card px-3.5 py-2.5 text-xs text-muted-foreground w-fit shadow-xs animate-pulse">
                      <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs">{currentStep}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Prioritizing verified platform database first...
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Footer / Input */}
            {isAuthenticated && (
              <div className="border-t bg-card p-3 space-y-2 shrink-0">
                {/* Quick Prompts Carousel */}
                {messages.length <= 2 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {starterReplies.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="shrink-0 rounded-full border bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 px-3.5 py-2 focus-within:border-primary/50 focus-within:bg-background transition-colors">
                  <input
                    value={input}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything, search live map routes, log expenses, add rooms..."
                    className="h-8 flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    onClick={() => handleSend()}
                    className="size-8 rounded-xl shrink-0 cursor-pointer"
                  >
                    <SendHorizonal className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Bubble Button (always clickable) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="pointer-events-auto group relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Toggle AI Assistant"
        >
          <Sparkles className="size-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[8px] font-bold text-background ring-2 ring-background">
            AI
          </span>
        </button>
      </div>
    </>
  );
}
