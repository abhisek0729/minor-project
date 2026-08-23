"use client";

import dynamic from "next/dynamic";

const AIRobotChat = dynamic(
  () => import("@/app/features/landing/components/AIRobotChat"),
  { ssr: false }
);

export default function LazyAIRobotChat() {
  return <AIRobotChat />;
}
