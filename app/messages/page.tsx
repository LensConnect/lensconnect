"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header"; 
import { ChatInterface } from "@/app/components/ChatInterface";
// We need Suspense for useSearchParams
function MessagesContent() {
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("to");

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl h-[calc(100vh-64px)]">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-2 md:px-0">Messages</h1>
      <ChatInterface initialRecipientId={recipientId} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
