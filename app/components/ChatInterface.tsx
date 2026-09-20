"use client";

import React, { useEffect, useState, useRef, useOptimistic, startTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Search, Phone, Video, MoreVertical, Paperclip, Check, CheckCheck, Smile, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sendMessage } from "../chatActions/chat";
import { MessageSelect } from "@/app/src/db/schema";
import { supabase } from "@/lib/supabaseClient";
type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

type Profile = {
  id: number;
  fullname: string;
  profile_image_url: string;
};

interface ChatInterfaceProps {
  currentUserId:number;
  initialRecipientId?: number;
}

export function ChatInterface({ currentUserId, initialRecipientId }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [showMobileChat, setShowMobileChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (state, newMessage: Message) => [...state, newMessage]

  );


  useEffect(() =>{
    const channel = supabase.channel(`chat_user_${currentUserId}`)
    .on('broadcast',{event:`room-${currentUserId}`},({payload}) =>{
      if(payload.senderId === activeRecipient?.id){
        setMessages((prev)=>[...prev,payload])
      }
    })
    .subscribe();
    return () => {
      supabase.removeChannel(channel);

    };

  },[currentUserId, activeRecipient?.id]);

  useEffect(() => {
    if (!initialRecipientId) return;

    const recipient: Profile = {
      id: initialRecipientId,
      fullname: "New conversation",
      profile_image_url: "",
    };

    setConversations([recipient]);
    setActiveRecipient(recipient);
    setShowMobileChat(true);
  }, [initialRecipientId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredConversations = conversations.filter(c =>
    c.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRecipient) return;

    const currentText = newMessage;
    setNewMessage('');

    const dummyMessage: Message = {
      id: String(Math.random()), // Temporary ID
      senderId: String(currentUserId),
      recipientId: String(activeRecipient.id),
      content: currentText,
      created_at: new Date().toISOString(),
      is_read: false,
    };

   
     startTransition(() => {
      addOptimisticMessage(dummyMessage);
    });

      const result = await sendMessage({
      senderId: currentUserId,
      recipientId: activeRecipient.id,
      content: currentText
    });
      if (result) {
      // Replace the temporary random item with the real MySQL returned row data
      setMessages((prev) => [...prev, result as any]);
    } else {
      alert(result || "Something went sideways sending your message.");
    }
  };



 
  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[560px] md:h-[700px] w-full overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_20px_60px_-35px_hsl(var(--foreground)/0.35)]">
      {/* Sidebar - visible on md+, or on mobile when chat is not active */}
      <div className={cn(
        "w-full md:w-[21rem] border-r border-border/70 bg-muted/20 flex flex-col",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="border-b border-border/70 bg-card p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Inbox</p>
              <h2 className="mt-1 font-bold text-xl tracking-tight">Messages</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="More message options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="h-10 rounded-xl border-border/70 bg-muted/40 pl-9 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5 p-3">
            {filteredConversations.map((profile) => {
              const isOnline = onlineUsers.has(profile.id);
              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActiveRecipient(profile);
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-card group relative",
                    activeRecipient?.id === profile.id ? "bg-card shadow-sm ring-1 ring-primary/15" : "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    <Avatar className={cn("h-11 w-11 border-2 transition-colors", activeRecipient?.id === profile.id ? "border-primary/20" : "border-transparent")}>
                      <AvatarImage src={profile.profile_image_url} />
                      <AvatarFallback className="bg-primary/10 text-primary"><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn("font-semibold truncate", activeRecipient?.id === profile.id ? "text-foreground" : "text-foreground")}>
                        {profile.fullname || "Unknown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-70">Chat</span>
                    </div>
                    <div className="text-xs truncate opacity-70">
                      Open conversation
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredConversations.length === 0 && (
                <div className="mx-2 rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center text-sm text-muted-foreground">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="h-5 w-5" />
                  </div>
                </div>
                <p className="font-semibold text-foreground">No matches found</p>
                <p className="mt-1 text-xs">Try another name or start a new conversation from a profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area - visible on md+, or on mobile when chat is active */}
      <div className={cn(
        "flex-1 flex flex-col bg-background min-w-0 min-h-0",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {activeRecipient ? (
          <>
            {/* Header */}
            <div className="min-h-16 px-3 md:px-6 border-b border-border/70 flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back button - mobile only */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 shrink-0 rounded-xl"
                  onClick={() => setShowMobileChat(false)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border/70">
                    <AvatarImage src={activeRecipient.profile_image_url} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(activeRecipient.id) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold leading-none tracking-tight">{activeRecipient.fullname}</h3>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("h-1.5 w-1.5 rounded-full", onlineUsers.has(activeRecipient.id) ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                    {onlineUsers.has(activeRecipient.id) ? "Online now" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0 md:gap-1">
                <Button variant="ghost" size="icon" disabled title="Voice calls coming soon" aria-label="Voice call" className="text-muted-foreground h-9 w-9 rounded-xl opacity-50">
                  <Phone className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" disabled title="Video calls coming soon" aria-label="Video call" className="text-muted-foreground h-9 w-9 rounded-xl opacity-50">
                  <Video className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="More conversation options" className="text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9 rounded-xl">
                  <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.06),transparent_38%)] p-3 md:p-8">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {/* Date separator example */}
                <div className="flex items-center gap-4 py-5">
                  <div className="h-[1px] bg-border flex-1"></div>
                  <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Today</span>
                  <div className="h-[1px] bg-border flex-1"></div>
                </div>

                {messages.map((msg, i) => {
                  const isMe = false;
                  const isLast = i === messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex max-w-[85%] md:max-w-[75%] flex-col gap-1",
                        isMe ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-3 text-sm leading-relaxed shadow-sm relative group",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-primary/15"
                            : "bg-card border-border/70 text-card-foreground rounded-2xl rounded-tl-sm shadow-black/5"
                        )}>
                          {msg.content}
                          <span className={cn(
                            "text-[10px] ml-2 inline-block opacity-70",
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </span>
                        </div>

                        {isMe && isLast && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                            <span>{msg.is_read ? 'Read' : 'Delivered'}</span>
                            {msg.is_read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border/70 bg-card p-3 md:p-5 shrink-0">
              <form className="max-w-3xl mx-auto relative flex items-center gap-1 md:gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 h-9 w-9 md:h-10 md:w-10">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="h-11 rounded-2xl border-border/70 bg-muted/40 pr-12 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "h-11 w-11 rounded-2xl shrink-0 transition-transform active:scale-95",
                    !newMessage.trim() ? "opacity-50" : "shadow-md hover:shadow-lg"
                  )}
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-5 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.07),transparent_45%)] text-center p-8">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-primary/10 flex items-center justify-center rotate-3">
              <Send className="h-7 w-7 md:h-9 md:w-9 text-primary -rotate-3" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">LensConnect inbox</p>
              <h3 className="font-bold text-lg md:text-xl tracking-tight">Choose a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Select a conversation to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
