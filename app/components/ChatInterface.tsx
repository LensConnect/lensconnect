"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Search, Phone, Video, MoreVertical, Paperclip, Check, CheckCheck, Smile, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

type Profile = {
  id: string;
  full_name: string;
  profile_image_url: string;
};

interface ChatInterfaceProps {
  initialRecipientId?: string | null;
}

export function ChatInterface({ initialRecipientId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch recent conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      const contactIds = Array.from(
        new Set(
          data.flatMap((msg) =>
            [msg.sender_id, msg.receiver_id].filter((id) => id !== user.id)
          )
        )
      );

      if (contactIds.length === 0 && initialRecipientId) {
        contactIds.push(initialRecipientId);
      } else if (initialRecipientId && !contactIds.includes(initialRecipientId)) {
        contactIds.push(initialRecipientId);
      }

      if (contactIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, profile_image_url")
          .in("id", contactIds);

        if (profiles) {
          setConversations(profiles);
          if (initialRecipientId) {
            const selected = profiles.find((p) => p.id === initialRecipientId);
            if (selected) setActiveRecipient(selected);
          }
        }
      }
    };

    fetchConversations();
  }, [user, initialRecipientId]);

  
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('global_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const activeIds = new Set(Object.keys(newState));
        setOnlineUsers(activeIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // 3. Fetch messages & Realtime subscription
  useEffect(() => {
    if (!user || !activeRecipient) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeRecipient.id}),and(sender_id.eq.${activeRecipient.id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching messages:", error);
      else setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === activeRecipient.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeRecipient]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeRecipient) return;

    const optimisicMessage: Message = {
      id: "temp-" + Date.now(),
      sender_id: user.id,
      receiver_id: activeRecipient.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages((prev) => [...prev, optimisicMessage]);
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeRecipient.id,
      content: optimisicMessage.content,
    });

    if (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[700px] w-full border rounded-xl overflow-hidden bg-background shadow-lg">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/5 flex flex-col md:flex hidden sm:flex"> {/* Hide on very small screens if needed, but keeping simple for now */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Messages</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-background/50 border-muted-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 space-y-1">
            {filteredConversations.map((profile) => {
              const isOnline = onlineUsers.has(profile.id);
              return (
                <button
                  key={profile.id}
                  onClick={() => setActiveRecipient(profile)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted group relative",
                    activeRecipient?.id === profile.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Avatar className={cn("border-2 transition-colors", activeRecipient?.id === profile.id ? "border-primary/20" : "border-transparent")}>
                      <AvatarImage src={profile.profile_image_url} />
                      <AvatarFallback className="bg-primary/10 text-primary"><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn("font-medium truncate", activeRecipient?.id === profile.id ? "text-primary" : "text-foreground")}>
                        {profile.full_name || "Unknown"}
                      </span>
                      {/* Placeholder time */}
                      <span className="text-[10px] text-muted-foreground opacity-70">12:30 PM</span>
                    </div>
                    <div className="text-xs truncate opacity-70">
                      Tap to view conversation
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <div className="flex justify-center mb-2">
                  <User className="h-8 w-8 opacity-20" />
                </div>
                No conversations found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm">
        {activeRecipient ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 border-b flex items-center justify-between bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={activeRecipient.profile_image_url} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(activeRecipient.id) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold leading-none">{activeRecipient.full_name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {onlineUsers.has(activeRecipient.id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 md:p-6 bg-muted/5">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {/* Date separator example */}
                <div className="flex items-center gap-4 py-4">
                  <div className="h-[1px] bg-border flex-1"></div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</span>
                  <div className="h-[1px] bg-border flex-1"></div>
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
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
                        "flex max-w-[75%] flex-col gap-1",
                        isMe ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-2.5 text-sm shadow-sm relative group",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                            : "bg-card border text-card-foreground rounded-2xl rounded-tl-sm"
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
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto relative flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12 py-6 rounded-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "h-12 w-12 rounded-full shrink-0 transition-transform active:scale-95",
                    !newMessage.trim() ? "opacity-50" : "shadow-md hover:shadow-lg"
                  )}
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-muted/5 text-center p-8">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
              <User className="h-10 w-10 text-primary/20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Select a conversation from the sidebar to start chatting or send a new message.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
