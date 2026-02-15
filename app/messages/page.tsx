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
    <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
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
