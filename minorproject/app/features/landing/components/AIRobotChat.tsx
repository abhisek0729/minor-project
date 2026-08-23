"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Image as ImageIcon,
  ListOrdered,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Radio,
  SendHorizonal,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ui/image-upload";
import { executeAgentAction } from "@/app/features/ai/actions/agent-action";

const starterReplies = [
  "Book a hotel room in Pokhara for tomorrow",
  "Reserve a table for 4 at Thakali kitchen in Thamel",
  "Emergency SOS: tourist police & mountain rescue",
  "Log an expense of NPR 2500 for dinner in Pokhara",
];

// Clean text specifically for Text-to-Speech (TTS) natural spoken playback
function cleanSpokenTTS(text: string, actionProposal?: ActionProposal): string {
  if (!text) return "";
  
  let spoken = text;
  // Remove markdown links [Title](url) -> Title
  spoken = spoken.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove markdown formatting: bold, italic, headers, backticks, tildes
  spoken = spoken.replace(/[*#`_~]/g, "");
  // Remove bullet points and dashes at beginning of lines
  spoken = spoken.replace(/^[-•*]\s+/gm, "");
  // Remove emojis
  spoken = spoken.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, "");
  // Replace currency and units with natural spoken terms
  spoken = spoken.replace(/\bNPR\b|\bRs\.?\b/gi, "rupees");
  spoken = spoken.replace(/\b(\d+)\s*m\b/gi, "$1 meters");
  spoken = spoken.replace(/\b(\d+)\s*km\b/gi, "$1 kilometers");
  // Clean whitespace & newlines
  spoken = spoken.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

  // If there is an action proposal for booking, add concise voice guidance for screen confirmation & checkout
  if (actionProposal && actionProposal.action_type === "CREATE_BOOKING") {
    spoken += " I have prepared your booking summary on screen. Please review the details and tap confirm to complete payment.";
  }

  // Cap to 3 concise sentences for natural TTS brevity
  const sentences = spoken.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 3) {
    spoken = sentences.slice(0, 3).join(" ");
  }

  return spoken;
}

type Recommendation = {
  name: string;
  type?: string;
  entity_type?: string;
  entity_id?: number | string;
  description?: string;
  reason?: string;
  price?: string;
  rating?: number;
  location?: string;
  map_url?: string;
  booking_note?: string;
  action_url?: string;
  url?: string;
  source?: "database" | "web_search";
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
  payload: Record<string, unknown>;
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

function renderInlineMarkdown(content: string): React.ReactNode {
  if (!content) return null;
  // Parse links [label](url), bold **text**, and italic *text*
  const tokenRegex = /(\[([^\]]+)\]\(\s*([^\)]+?)\s*\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(content)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(content.slice(lastIdx, match.index));
    }

    if (match[2] && match[3]) {
      // Link match
      const label = match[2];
      let url = match[3].trim();
      
      // Clean localhost prefix if present
      if (url.includes("localhost:3000/")) {
        url = url.substring(url.indexOf("localhost:3000") + "localhost:3000".length);
      }

      if (url.startsWith("http://") || url.startsWith("https://")) {
        nodes.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold underline inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <span>{label}</span>
            <ExternalLink className="size-3 inline-block" />
          </a>
        );
      } else {
        const cleanPath = url.startsWith("/") ? url : `/${url}`;
        nodes.push(
          <Link
            key={`link-${match.index}`}
            href={cleanPath}
            className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-md text-xs transition-all mx-0.5 shadow-2xs hover:shadow-xs"
          >
            <span>{label}</span>
            <ArrowRight className="size-3 inline-block" />
          </Link>
        );
      }
    } else if (match[4]) {
      // Bold match **text**
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // Italic match *text*
      nodes.push(
        <em key={`italic-${match.index}`} className="italic text-foreground/90">
          {match[5]}
        </em>
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < content.length) {
    nodes.push(content.slice(lastIdx));
  }

  return nodes;
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal separator
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="my-2 border-border/40" />;
        }

        // Headers: ### or ## or #
        const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerText = headerMatch[2];
          return (
            <div
              key={idx}
              className={`font-bold tracking-tight text-foreground ${
                level <= 2 ? "text-base mt-2 mb-1" : "text-sm font-semibold mt-1.5 mb-0.5"
              }`}
            >
              {renderInlineMarkdown(headerText)}
            </div>
          );
        }

        // Bullet point: • or * or -
        const bulletMatch = trimmed.match(/^([•\*\-]|(?:\d+\.))\s+(.+)$/);
        if (bulletMatch) {
          const bulletContent = bulletMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-primary font-bold select-none text-xs mt-0.5">▪</span>
              <div className="flex-1">{renderInlineMarkdown(bulletContent)}</div>
            </div>
          );
        }

        // Standalone link-only line: e.g. [Hotel Name](/hotels/3) or [Place](https://...)
        const standaloneLinkMatch = trimmed.match(/^\[([^\]]+)\]\(\s*([^)]+?)\s*\)$/);
        if (standaloneLinkMatch) {
          const label = standaloneLinkMatch[1];
          let url = standaloneLinkMatch[2].trim();
          if (url.includes("localhost:3000/")) {
            url = url.substring(url.indexOf("localhost:3000") + "localhost:3000".length);
          }
          if (url.startsWith("http://") || url.startsWith("https://")) {
            return (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1 rounded-lg text-sm transition-all my-0.5 shadow-2xs hover:shadow-xs"
              >
                <span>{label}</span>
                <ExternalLink className="size-3.5 inline-block" />
              </a>
            );
          }
          const cleanPath = url.startsWith("/") ? url : `/${url}`;
          return (
            <Link
              key={idx}
              href={cleanPath}
              className="inline-flex items-center gap-1.5 font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg text-sm transition-all my-0.5 shadow-2xs hover:shadow-xs"
            >
              <span>{label}</span>
              <ArrowRight className="size-3.5 inline-block" />
            </Link>
          );
        }

        return <p key={idx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

export default function AIRobotChat() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("Searching platform database...");
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [expandedStepsId, setExpandedStepsId] = useState<string | null>(null);
  
  // Voice & Speech States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize input textarea as user speaks or types long queries
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollH = textareaRef.current.scrollHeight;
      const nextH = Math.min(Math.max(scrollH, 36), 140);
      textareaRef.current.style.height = `${nextH}px`;
    }
  }, [input]);

  const isAuthenticated = status === "authenticated";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! 🙏 I am your TravelNepal AI Voice & Travel Assistant. Ask me to book hotels or restaurants, give safety guidance, or log expenses via voice or text!",
    },
  ]);

  // Clean up any ongoing TTS speech synthesis or recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Text-To-Speech Output Function
  const speakText = (text: string, actionProposal?: ActionProposal) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || isVoiceMuted) return;

    const spoken = cleanSpokenTTS(text, actionProposal);
    if (!spoken) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Select natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Jenny") ||
            v.lang === "en-US") &&
          !v.name.includes("Whisper")
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS synthesis error:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-To-Text Recognition Function (Web Speech API)
  const startListening = () => {
    if (typeof window === "undefined") return;
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onstart: () => void;
        onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
        abort: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onstart: () => void;
        onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
        abort: () => void;
      };
    };
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true; // Keep listening until user stops speaking

      // Silence-detection: stop after 3s of no new speech results
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      let finalTranscript = "";

      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          recognition.stop();
        }, 3000); // 3 second silence = done speaking
      };

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscript = "";
        toast.info("🎙️ Listening... Speak your request. Will auto-stop after silence.");
        resetSilenceTimer();
      };

      recognition.onresult = (event: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => {
        let interim = "";
        let full = "";
        const results = Array.from(event.results) as Array<{ 0: { transcript: string }; isFinal?: boolean }>;
        for (const result of results) {
          if (result.isFinal) {
            full += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        finalTranscript = full;
        setInput((full + interim).trim());
        resetSilenceTimer(); // Reset silence timer on any speech activity
      };

      recognition.onerror = (event: { error: string }) => {
        if (silenceTimer) clearTimeout(silenceTimer);
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsListening(false);
        // If we accumulated a final transcript, update input with it
        if (finalTranscript.trim()) {
          setInput(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query || isLoading) return;

    if (isSpeaking) {
      stopSpeaking();
    }

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
        const errorText =
          data.detail ||
          data.error ||
          "Sorry, I had trouble answering that. Please try again.";
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: errorText,
          },
        ]);
        speakText(errorText);
        return;
      }

      const answerText = data.answer || "Here is what I found for your trip:";
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: answerText,
          recommendations: data.recommendations || [],
          action_proposal: data.action_proposal || undefined,
          map_cards: data.map_cards || [],
          map_url: data.map_url || undefined,
          steps_taken: data.steps_taken || [],
          tools_used: data.tools_used || [],
        },
      ]);

      // Automatically speak TTS response with plain natural spoken text & booking prompts
      speakText(answerText, data.action_proposal);
    } catch {
      const connErr = "Unable to connect to the AI assistant service right now. Please check if the server is running.";
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: connErr,
        },
      ]);
      speakText(connErr);
    } finally {
      clearTimeout(stepTimer);
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, executingActionId, isExpanded]);

  // Listen for open-ai-chat custom events from cards & buttons
  useEffect(() => {
    const handleOpenAIChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.message) {
        setTimeout(() => {
          handleSend(customEvent.detail.message);
        }, 100);
      }
    };
    window.addEventListener("open-ai-chat", handleOpenAIChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenAIChat);
  }, []);

  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

  const handleInitiateKhalti = async (bookingId: number, amount: number, itemName: string) => {
    try {
      setIsInitiatingPayment(true);
      toast.info(`Connecting to Khalti secure checkout for ${itemName}...`);
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          itemName,
        }),
      });

      const data = await res.json();
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error(data.error || "Could not initiate Khalti payment session.");
      }
    } catch {
      toast.error("Failed to connect to Khalti payment gateway.");
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const handleConfirmAction = async (msgId: string, proposal: ActionProposal) => {
    setExecutingActionId(msgId);

    try {
      const res = await executeAgentAction(
        proposal as unknown as Parameters<typeof executeAgentAction>[0]
      );

      if (res.success) {
        toast.success(res.message);
        const resData = (res as any)?.data;
        const newBookingId = resData?.id;
        const executedRoomNumber = resData?.roomNumber || proposal.payload?.room_number;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === msgId && msg.action_proposal) {
              let updatedText = msg.text;
              if (executedRoomNumber) {
                updatedText = updatedText
                  .replace(/Room #\w+/g, `Room #${executedRoomNumber}`)
                  .replace(/Room 101/g, `Room #${executedRoomNumber}`);
              }

              return {
                ...msg,
                text: updatedText,
                action_proposal: {
                  ...msg.action_proposal,
                  status: "executed",
                  resultMessage: res.message,
                  payload: {
                    ...msg.action_proposal.payload,
                    room_number: executedRoomNumber || msg.action_proposal.payload.room_number,
                    bookingId: newBookingId || msg.action_proposal.payload.bookingId,
                  },
                },
              };
            }
            return msg;
          })
        );

        // If it was a booking, automatically prompt Khalti checkout
        if (proposal.action_type === "CREATE_BOOKING" && newBookingId) {
          const amt = Number(proposal.payload?.total_amount || proposal.payload?.amount) || 3500;
          const name = String(proposal.payload?.item_name || "Travel Booking");
          toast.info("Booking created! Redirecting to Khalti secure checkout...");
          setTimeout(() => {
            handleInitiateKhalti(newBookingId, amt, name);
          }, 800);
        }
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to execute action.";
      toast.error(errorMsg);
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
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {isOpen && (
          <div
            className={`pointer-events-auto flex flex-col overflow-hidden rounded-[26px] border border-border bg-card shadow-[0_24px_90px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out ${
              isExpanded
                ? "w-[min(96vw,920px)] h-[min(90vh,760px)]"
                : "w-[min(94vw,460px)] h-[min(85vh,600px)]"
            }`}
          >
            {/* Chat Window Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center text-primary-foreground backdrop-blur-sm relative">
                  <Sparkles className="size-5" />
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex size-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold leading-none">TravelNepal Voice AI</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/40 text-white">
                      TTS & Speech
                    </Badge>
                  </div>
                  <p className="text-[11px] text-primary-foreground/80 mt-0.5">
                    {isSpeaking
                      ? "Speaking aloud..."
                      : isListening
                      ? "Listening to your voice..."
                      : "Voice Search • Hotel/Food Booking • SOS"}
                  </p>
                </div>
              </div>

              {/* Window Controls (Voice Mute, TTS Stop, Enlarge & Close) */}
              <div className="flex items-center gap-1.5">
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white transition hover:bg-red-600 cursor-pointer animate-pulse"
                    title="Stop speaking"
                    aria-label="Stop speaking"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setIsVoiceMuted((prev) => !prev);
                    toast.info(
                      !isVoiceMuted
                        ? "Voice assistant muted."
                        : "Voice assistant unmuted (auto-speech enabled)."
                    );
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer ${
                    isVoiceMuted
                      ? "bg-white/10 text-white/50 hover:bg-white/20"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  title={isVoiceMuted ? "Unmute spoken voice" : "Mute spoken voice"}
                  aria-label={isVoiceMuted ? "Unmute spoken voice" : "Mute spoken voice"}
                >
                  {isVoiceMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

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
                  onClick={() => {
                    stopSpeaking();
                    stopListening();
                    setIsOpen(false);
                  }}
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
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed relative group ${
                          isExpanded ? "max-w-[85%]" : "max-w-[92%]"
                        } ${
                          message.role === "assistant"
                            ? "bg-card text-card-foreground shadow-xs border"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {/* Speaker replay button for Assistant Messages */}
                        {message.role === "assistant" && (
                          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-border/40 text-[11px] text-muted-foreground">
                            <span className="font-semibold flex items-center gap-1 text-primary">
                              <Radio className="size-3 text-emerald-500 animate-pulse" /> Voice Guide
                            </span>
                            <button
                              type="button"
                              onClick={() => speakText(message.text, message.action_proposal)}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-muted"
                              title="Listen to response"
                            >
                              <Volume2 className="size-3.5" />
                              <span className="text-[10px]">Listen</span>
                            </button>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap leading-relaxed">
                          {renderFormattedText(message.text)}
                        </div>

                        {/* RAG & Search Steps Breakdown */}
                        {message.steps_taken && message.steps_taken.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-border/40">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStepsId(
                                  expandedStepsId === message.id ? null : message.id
                                )
                              }
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <ListOrdered className="size-3 text-primary" />
                              <span>
                                {message.steps_taken.length} Verification Steps Completed
                              </span>
                              {expandedStepsId === message.id ? (
                                <ChevronUp className="size-3 ml-0.5" />
                              ) : (
                                <ChevronDown className="size-3 ml-0.5" />
                              )}
                            </button>

                            {expandedStepsId === message.id && (
                              <div className="mt-1.5 space-y-1 rounded-lg bg-muted/50 p-2 text-[10px] text-muted-foreground border">
                                {message.steps_taken.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <span className="font-mono text-primary font-bold">
                                      {idx + 1}.
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                                {message.tools_used && message.tools_used.length > 0 && (
                                  <div className="pt-1 mt-1 border-t border-border/30 flex items-center gap-1">
                                    <span className="font-semibold text-foreground">
                                      Tools Used:
                                    </span>
                                    <span className="font-mono text-primary truncate">
                                      {message.tools_used.join(", ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Google Maps Cards */}
                        {message.map_cards && message.map_cards.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-border/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                📍 Live Map Locations & Directions:
                              </p>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                                Google Maps
                              </Badge>
                            </div>
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
                              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2 text-emerald-800 dark:text-emerald-300">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Action Executed Successfully!</span>
                                </div>
                                <p className="text-[11px] leading-snug">
                                  {message.action_proposal.resultMessage ||
                                    "Changes have been committed to the platform."}
                                </p>
                                {message.action_proposal.action_type === "CREATE_BOOKING" && (
                                  <div className="pt-2 flex flex-wrap gap-2 items-center">
                                    <button
                                      type="button"
                                      disabled={isInitiatingPayment}
                                      onClick={() => {
                                        const proposalPayload = message.action_proposal?.payload || {};
                                        const bId =
                                          Number((proposalPayload as any).bookingId) ||
                                          Number(
                                            message.action_proposal?.resultMessage?.match(/Booking #(\d+)/)?.[1]
                                          ) ||
                                          1;
                                        const amt =
                                          Number(proposalPayload.total_amount || proposalPayload.amount) ||
                                          3500;
                                        const name = String(
                                          proposalPayload.item_name || "Hotel Reservation"
                                        );
                                        handleInitiateKhalti(bId, amt, name);
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-3.5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      <CreditCard className="size-3.5" />
                                      <span>
                                        {isInitiatingPayment
                                          ? "Redirecting to Khalti..."
                                          : "Pay with Khalti (Direct Checkout) →"}
                                      </span>
                                    </button>

                                    <Link href="/dashboard">
                                      <Button size="sm" variant="outline" className="text-xs h-8">
                                        Dashboard
                                      </Button>
                                    </Link>
                                  </div>
                                )}
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

                                {/* Key-Value Details & Schema Form Fields */}
                                <div className="rounded-lg bg-background/90 p-2.5 border text-xs space-y-2">
                                  {message.action_proposal.action_type === "ADD_HOTEL_ROOM" ? (
                                    <div className="space-y-2 text-left">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Room Number
                                          </label>
                                          <input
                                            type="text"
                                            value={String(message.action_proposal.payload.room_number || "")}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          title: val ? `Add Hotel Room #${val}` : "Add Hotel Room",
                                                          description: val
                                                            ? `Publish Room #${val} (${m.action_proposal.payload.room_type || "Double"}) at NPR ${Number(m.action_proposal.payload.price_per_night || 2500).toLocaleString()}/night to your catalog.`
                                                            : "Publish a new room to your hotel catalog.",
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            room_number: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="e.g. 101, 102"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Room Type
                                          </label>
                                          <select
                                            value={String(
                                              message.action_proposal.payload.room_type || "double"
                                            ).toLowerCase()}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            room_type: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            className="w-full h-7 px-1.5 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          >
                                            <option value="single">Single</option>
                                            <option value="double">Double</option>
                                            <option value="twin">Twin</option>
                                            <option value="family">Family</option>
                                            <option value="suite">Suite</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Price / Night (NPR)
                                          </label>
                                          <input
                                            type="number"
                                            value={
                                              Number(
                                                message.action_proposal.payload.price_per_night || 0
                                              ) || ""
                                            }
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            price_per_night: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="2500"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Capacity (Guests)
                                          </label>
                                          <input
                                            type="number"
                                            value={Number(
                                              message.action_proposal.payload.capacity || 2
                                            )}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            capacity: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="2"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                          Description
                                        </label>
                                        <input
                                          type="text"
                                          value={String(
                                            message.action_proposal.payload.description || ""
                                          )}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setMessages((prev) =>
                                              prev.map((m) =>
                                                m.id === message.id && m.action_proposal
                                                  ? {
                                                      ...m,
                                                      action_proposal: {
                                                        ...m.action_proposal,
                                                        payload: {
                                                          ...m.action_proposal.payload,
                                                          description: val,
                                                        },
                                                      },
                                                    }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Comfortable room with modern amenities."
                                          className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                      </div>
                                    </div>
                                  ) : message.action_proposal.action_type === "ONBOARD_HOTEL" ||
                                    message.action_proposal.action_type === "CREATE_HOTEL" ? (
                                    <div className="space-y-2 text-left">
                                      <div>
                                        <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                          Hotel Name
                                        </label>
                                        <input
                                          type="text"
                                          value={String(
                                            message.action_proposal.payload.hotel_name ||
                                              message.action_proposal.payload.name ||
                                              ""
                                          )}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setMessages((prev) =>
                                              prev.map((m) =>
                                                m.id === message.id && m.action_proposal
                                                  ? {
                                                      ...m,
                                                      action_proposal: {
                                                        ...m.action_proposal,
                                                        payload: {
                                                          ...m.action_proposal.payload,
                                                          hotel_name: val,
                                                          name: val,
                                                        },
                                                      },
                                                    }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Grand Pokhara Resort"
                                          className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            District / City
                                          </label>
                                          <input
                                            type="text"
                                            value={String(
                                              message.action_proposal.payload.district ||
                                                message.action_proposal.payload.city ||
                                                ""
                                            )}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            district: val,
                                                            city: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="Kaski / Pokhara"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Phone Number
                                          </label>
                                          <input
                                            type="text"
                                            value={String(
                                              message.action_proposal.payload.phone ||
                                                message.action_proposal.payload.phone_number ||
                                                ""
                                            )}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            phone: val,
                                                            phone_number: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="98XXXXXXXX"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                          Description
                                        </label>
                                        <input
                                          type="text"
                                          value={String(
                                            message.action_proposal.payload.description || ""
                                          )}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setMessages((prev) =>
                                              prev.map((m) =>
                                                m.id === message.id && m.action_proposal
                                                  ? {
                                                      ...m,
                                                      action_proposal: {
                                                        ...m.action_proposal,
                                                        payload: {
                                                          ...m.action_proposal.payload,
                                                          description: val,
                                                        },
                                                      },
                                                    }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Modern boutique hotel with mountain views."
                                          className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                      </div>
                                    </div>
                                  ) : message.action_proposal.action_type === "ADD_RESTAURANT_DISH" ? (
                                    <div className="space-y-2 text-left">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Dish Name
                                          </label>
                                          <input
                                            type="text"
                                            value={String(message.action_proposal.payload.name || "")}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          title: val ? `Add Dish: ${val}` : "Add Menu Item",
                                                          description: val
                                                            ? `Publish "${val}" to your restaurant menu at NPR ${Number(m.action_proposal.payload.price || 0).toLocaleString()}.`
                                                            : "Publish a new dish to your menu.",
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            name: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="e.g. Dal Bhat, Momo, Thukpa"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Category
                                          </label>
                                          <select
                                            value={String(message.action_proposal.payload.category || "main").toLowerCase()}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            category: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            className="w-full h-7 px-1.5 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          >
                                            <option value="appetizer">Appetizer</option>
                                            <option value="main">Main Course</option>
                                            <option value="dessert">Dessert</option>
                                            <option value="beverage">Beverage</option>
                                            <option value="snack">Snack</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Price (NPR)
                                          </label>
                                          <input
                                            type="number"
                                            value={Number(message.action_proposal.payload.price || 0) || ""}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            price: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="350"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                            Prep Time (mins)
                                          </label>
                                          <input
                                            type="number"
                                            value={Number(message.action_proposal.payload.preparation_time || 15)}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              setMessages((prev) =>
                                                prev.map((m) =>
                                                  m.id === message.id && m.action_proposal
                                                    ? {
                                                        ...m,
                                                        action_proposal: {
                                                          ...m.action_proposal,
                                                          payload: {
                                                            ...m.action_proposal.payload,
                                                            preparation_time: val,
                                                          },
                                                        },
                                                      }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="15"
                                            className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                          Description
                                        </label>
                                        <input
                                          type="text"
                                          value={String(message.action_proposal.payload.description || "")}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setMessages((prev) =>
                                              prev.map((m) =>
                                                m.id === message.id && m.action_proposal
                                                  ? {
                                                      ...m,
                                                      action_proposal: {
                                                        ...m.action_proposal,
                                                        payload: {
                                                          ...m.action_proposal.payload,
                                                          description: val,
                                                        },
                                                      },
                                                    }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Authentic Nepali dish served with rice and pickles."
                                          className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    Object.entries(message.action_proposal.payload).map(
                                      ([k, v]) => {
                                        if (k.includes("image") || k.includes("public_id"))
                                          return null;
                                        return (
                                          <div
                                            key={k}
                                            className="flex justify-between items-center capitalize"
                                          >
                                            <span className="text-muted-foreground text-[11px]">
                                              {k.replace(/_/g, " ")}:
                                            </span>
                                            <span className="font-semibold text-foreground truncate max-w-[200px] text-[11px]">
                                              {typeof v === "number" &&
                                              (k.includes("price") || k === "amount")
                                                ? `NPR ${v.toLocaleString()}`
                                                : String(v)}
                                            </span>
                                          </div>
                                        );
                                      }
                                    )
                                  )}
                                </div>

                                {/* Cloudinary Photo Upload Integration */}
                                {(message.action_proposal.action_type === "ADD_HOTEL_ROOM" ||
                                  message.action_proposal.action_type === "ADD_RESTAURANT_DISH" ||
                                  message.action_proposal.action_type === "ONBOARD_HOTEL" ||
                                  message.action_proposal.action_type === "ONBOARD_RESTAURANT" ||
                                  message.action_proposal.action_type === "CREATE_HOTEL") && (
                                  <div className="pt-2 border-t border-border/50 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-foreground flex items-center gap-1">
                                        <Camera className="size-3 text-primary" /> Attach Photo (Cloudinary)
                                      </span>
                                      {message.action_proposal.payload.image_url ||
                                      message.action_proposal.payload.cover_image_url ? (
                                        <span className="text-[10px] text-emerald-600 font-bold">✓ Attached</span>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground">Optional</span>
                                      )}
                                    </div>
                                    <ImageUpload
                                      value={
                                        message.action_proposal.payload.cover_image_url
                                          ? [String(message.action_proposal.payload.cover_image_url)]
                                          : message.action_proposal.payload.image_url
                                          ? [String(message.action_proposal.payload.image_url)]
                                          : []
                                      }
                                      folder={
                                        message.action_proposal.action_type === "ADD_HOTEL_ROOM"
                                          ? "tourism/rooms"
                                          : message.action_proposal.action_type.includes("HOTEL")
                                          ? "tourism/hotels"
                                          : "tourism/restaurant"
                                      }
                                      onChange={(urls) => {
                                        if (urls.length > 0) {
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m.id === message.id && m.action_proposal
                                                ? {
                                                    ...m,
                                                    action_proposal: {
                                                      ...m.action_proposal,
                                                      payload: {
                                                        ...m.action_proposal.payload,
                                                        image_url: urls[0],
                                                        cover_image_url: urls[0],
                                                        cover_image_public_id:
                                                          urls[0].split("/").pop() || "workspace_cover",
                                                      },
                                                    },
                                                  }
                                                : m
                                            )
                                          );
                                          toast.success("Photo uploaded to Cloudinary!");
                                        }
                                      }}
                                      onRemove={() => {
                                        setMessages((prev) =>
                                          prev.map((m) =>
                                            m.id === message.id && m.action_proposal
                                              ? {
                                                  ...m,
                                                  action_proposal: {
                                                    ...m.action_proposal,
                                                    payload: {
                                                      ...m.action_proposal.payload,
                                                      image_url: "",
                                                      image_public_id: "",
                                                    },
                                                  },
                                                }
                                              : m
                                          )
                                        );
                                      }}
                                    />
                                  </div>
                                )}

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
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Recommended Stays & Places:
                              </p>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                                Verified RAG + Web Search
                              </Badge>
                            </div>
                            <div
                              className={`grid gap-2 ${
                                isExpanded ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                              }`}
                            >
                              {message.recommendations.map((rec, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl border bg-background/90 p-3 space-y-2 text-xs transition hover:border-primary/50 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-bold text-foreground truncate text-sm">
                                      {rec.name}
                                    </p>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0.5 capitalize font-semibold bg-primary/10 text-primary border-primary/20"
                                    >
                                      {rec.type || rec.entity_type || "hotel"}
                                    </Badge>
                                  </div>

                                  {(rec.reason || rec.description) && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                      {rec.reason || rec.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                                    {rec.location && (
                                      <p className="flex items-center gap-1 truncate max-w-[65%]">
                                        <MapPin className="size-3 shrink-0 text-primary" />
                                        <span className="truncate">{rec.location}</span>
                                      </p>
                                    )}
                                    {rec.price && (
                                      <span className="font-semibold text-foreground text-[11px] ml-auto shrink-0">
                                        {rec.price}
                                      </span>
                                    )}
                                  </div>

                                  {(() => {
                                    const cat = (rec.type || rec.entity_type || "hotel").toLowerCase();
                                    const targetUrl =
                                      rec.url ||
                                      rec.action_url ||
                                      (rec.entity_id
                                        ? `/${cat === "restaurant" ? "restaurants" : "hotels"}/${rec.entity_id}`
                                        : undefined) ||
                                      rec.map_url;

                                    if (!targetUrl) return null;

                                    const isExternal = targetUrl.startsWith("http");
                                    return (
                                      <div className="pt-1.5 border-t border-border/40 flex items-center justify-between">
                                        {isExternal ? (
                                          <a
                                            href={targetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg transition-all shadow-2xs hover:shadow-xs"
                                          >
                                            <span>Open Live Map & Directions</span>
                                            <ExternalLink className="size-3.5" />
                                          </a>
                                        ) : (
                                          <Link
                                            href={targetUrl}
                                            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg transition-all shadow-2xs hover:shadow-xs"
                                          >
                                            <span>
                                              View {cat === "restaurant" ? "Menu" : "Hotel"} Details
                                            </span>
                                            <ArrowRight className="size-3.5" />
                                          </Link>
                                        )}
                                      </div>
                                    );
                                  })()}
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

            {/* Chat Footer / Input with Voice Recognition & Quick Starters */}
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

                {/* Listening Alert / Status */}
                {isListening && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="font-semibold">Listening to spoken voice...</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-2xl border bg-muted/50 p-2 focus-within:border-primary/50 focus-within:bg-background transition-all">
                  {/* Microphone Speech Input Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`size-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mb-0.5 ${
                      isListening
                        ? "bg-red-500 text-white animate-bounce shadow-md"
                        : "bg-background text-muted-foreground hover:text-primary hover:bg-primary/10 border"
                    }`}
                    title={isListening ? "Stop listening" : "Speak with Voice Assistant"}
                    aria-label={isListening ? "Stop listening" : "Speak with Voice Assistant"}
                  >
                    {isListening ? (
                      <MicOff className="size-4" />
                    ) : (
                      <Mic className="size-4" />
                    )}
                  </button>

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening to your voice... (text appears here)..."
                        : "Speak or type: 'Book hotel in Pokhara', 'Travel from Butwal to Dharan'..."
                    }
                    className="min-h-[36px] max-h-[140px] flex-1 resize-none bg-transparent py-1.5 px-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50 leading-relaxed overflow-y-auto"
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
                    aria-label="Send message to AI assistant"
                    className="size-8 rounded-xl shrink-0 cursor-pointer mb-0.5"
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
          aria-label={isOpen ? "Close AI Assistant" : "Open TravelNepal AI Voice & Travel Assistant"}
          aria-expanded={isOpen}
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
