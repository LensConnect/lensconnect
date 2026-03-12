"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ImageIcon,
  Settings,
  MapPin,
  Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Booking = {
  id: string;
  client_id: string;
  photographer_id: string;
  start_time: string;
  duration_hours: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "accepted" | "rejected";
  total_price: number;
  shoot_type: string;
  location: string;
  message?: string;
  profiles?: {
    full_name: string;
  };
};

export default function PhotographerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, profiles:client_id(full_name)")
      .eq("photographer_id", user.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
      return;
    }
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && user.role === "photographer") {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push("/login");
      else if (user.role === "client") router.push("/dashboard/client");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "photographer") return null;

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Booking ${newStatus} successfully`);
    fetchBookings();
  };

  const upcomingBookings = bookings.filter(b => (b.status === "confirmed" || b.status === "accepted") && b.start_time && new Date(b.start_time).getTime() >= new Date().setHours(0, 0, 0, 0));
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const thisMonthEarnings = completedBookings.filter((b) => {
    const bookingDate = new Date(b.start_time);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
  }).reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-[1440px]">
        {/* Cinematic Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Overview</h1>
            <p className="text-lg text-muted-foreground font-normal">Welcome back, <span className="text-foreground font-medium">{user.name}</span></p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="rounded-full h-12 px-6 bg-secondary/30 border-none hover:bg-secondary/50">
              <Link href="/dashboard/portfolio">
                <ImageIcon className="h-4 w-4 mr-2 text-accent" /> Portfolio Manager
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full h-12 px-6 bg-secondary/30 border-none hover:bg-secondary/50">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Minimalist Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Earnings (YTD)</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">${totalEarnings.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
              <TrendingUp className="w-4 h-4" /> <span>+${thisMonthEarnings.toLocaleString()} this month</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Upcoming Shoots</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">{upcomingBookings.length}</div>
            <p className="text-sm font-medium text-muted-foreground">{pendingBookings.length} pending requests</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Profile Views</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Eye className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">1.2k</div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
              <TrendingUp className="w-4 h-4" /> <span>+14% from last week</span>
            </div>
          </motion.div>
        </div>

        {/* Elegant Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-transparent border-b border-border/50 rounded-none w-full justify-start h-auto p-0 gap-8">
            <TabsTrigger value="upcoming" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Upcoming <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{upcomingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Pending Inquiries <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{pendingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Completed <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{completedBookings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => <PhotographerBookingCard key={booking.id} booking={booking} onStatusUpdate={handleUpdateStatus} />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No upcoming shoots scheduled.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 outline-none">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => <PhotographerBookingCard key={booking.id} booking={booking} showActions onStatusUpdate={handleUpdateStatus} />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Inbox zero. No pending inquiries.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 outline-none">
            {completedBookings.length > 0 ? (
              completedBookings.map((booking) => <PhotographerBookingCard key={booking.id} booking={booking} />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Completed shoots will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PhotographerBookingCard({ booking, showActions = false, onStatusUpdate }: { booking: Booking; showActions?: boolean; onStatusUpdate?: (id: string, status: string) => void; }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "Verification Required" },
    confirmed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Confirmed" },
    accepted: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Accepted" },
    completed: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", label: "Archived" },
    cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", label: "Cancelled" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", label: "Declined" },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  const durationLabel = booking.duration_hours ? `${booking.duration_hours} ${booking.duration_hours === 1 ? 'hour' : 'hours'}` : "N/A";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-2xl tracking-tight capitalize">{booking.shoot_type} Session</h3>
              <Badge variant="outline" className={`${status.bg} ${status.color} font-semibold uppercase tracking-widest px-3 py-1 text-[10px]`}>
                <StatusIcon className="h-3 w-3 mr-1.5" />{status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">Client: <span className="text-foreground">{booking.profiles?.full_name || "Confidential"}</span></p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold tracking-tight">${booking.total_price || 0}</div>
             <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total Revenue</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm font-medium">
          <div className="flex items-center gap-2.5 bg-background/50 px-4 py-2 rounded-xl border border-border/30">
            <Calendar className="h-4 w-4 text-accent" />
            <span>{booking.start_time ? new Date(booking.start_time).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "TBD"}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-background/50 px-4 py-2 rounded-xl border border-border/30">
            <Clock className="h-4 w-4 text-accent" />
            <span>{booking.start_time ? new Date(booking.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "TBD"} ({durationLabel})</span>
          </div>
          <div className="flex items-center gap-2.5 bg-background/50 px-4 py-2 rounded-xl border border-border/30">
            <MapPin className="h-4 w-4 text-accent" />
            <span>{booking.location}</span>
          </div>
        </div>

        {booking.message && (
          <div className="mt-4 p-5 rounded-2xl bg-background/40 border border-border/30">
            <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">"{booking.message}"</p>
          </div>
        )}
      </div>

      <div className="flex lg:flex-col gap-3 shrink-0 mt-4 lg:mt-0">
        {showActions && booking.status === "pending" && (
          <>
            <Button size="lg" className="rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90 flex-1 lg:w-40" onClick={() => onStatusUpdate?.(booking.id, "accepted")}>
              Approve
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive flex-1 lg:w-40 bg-transparent" onClick={() => onStatusUpdate?.(booking.id, "rejected")}>
              Decline
            </Button>
          </>
        )}
        {booking.status === "accepted" && (
          <Button size="lg" className="rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 w-full lg:w-48" onClick={() => onStatusUpdate?.(booking.id, "completed")}>
            Mark Completed
          </Button>
        )}
      </div>
    </motion.div>
  );
}
