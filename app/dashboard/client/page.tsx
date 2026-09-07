"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Heart,
  Settings,
  MessageSquare,
  MapPin
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
  status: string;
  total_price: number;
  shoot_type: string;
  location: string;
  message?: string;
  profiles?: {
    full_name: string;
  };
};

export default function ClientDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, profiles:photographer_id(full_name)")
      .eq("client_id", user.id)
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
    if (user && user.role === "client") {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push("/login");
      else if (user.role === "photographer") router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel and delete this booking request?")) return;

    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again.");
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success("Booking cancelled successfully");
    fetchBookings();
  };

  if (isLoading || !user || user.role !== "client") return null;

  const upcomingBookings = bookings.filter((b) => (b.status === "confirmed" || b.status === "accepted") && b.start_time && new Date(b.start_time).getTime() > new Date().getTime());
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-[1440px]">
        {/* Cinematic Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Client Portal</h1>
            <p className="text-lg text-muted-foreground font-normal">Welcome back, <span className="text-foreground font-medium">{user.fullname}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full h-12 px-6 bg-foreground text-background font-semibold hover:bg-foreground/90">
              <Link href="/photographers"><Search className="h-4 w-4 mr-2" /> Find Photographers</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full h-12 px-6 bg-secondary/30 border-none hover:bg-secondary/50">
              <Link href="/dashboard/settings"><Settings className="h-4 w-4 mr-2" /> Settings</Link>
            </Button>
          </div>
        </div>

        {/* Minimalist Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Total Bookings</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">{bookings.length}</div>
            <p className="text-sm font-medium text-muted-foreground">Lifetime shoots</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="p-8 rounded-[2rem] bg-accent border border-border/40 group overflow-hidden relative">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">Upcoming</h3>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2 text-white relative z-10">{upcomingBookings.length}</div>
            <p className="text-sm font-medium text-white/80 relative z-10">Confirmed sessions</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Pending</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">{pendingBookings.length}</div>
            <p className="text-sm font-medium text-muted-foreground">Awaiting response</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Completed</h3>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-accent" /></div>
            </div>
            <div className="text-5xl font-bold tracking-tight mb-2">{completedBookings.length}</div>
            <p className="text-sm font-medium text-muted-foreground">Finished sessions</p>
          </motion.div>
        </div>

        {/* Elegant Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-transparent border-b border-border/50 rounded-none w-full justify-start h-auto p-0 gap-8">
            <TabsTrigger value="upcoming" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Upcoming <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{upcomingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Pending Validation <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{pendingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-lg font-medium tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-4 text-muted-foreground transition-none">
              Archived <Badge variant="secondary" className="ml-2 bg-secondary text-foreground">{completedBookings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} showCancel onCancel={handleCancelBooking} />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-6">Your calendar is clear.</p>
                <Button asChild className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90"><Link href="/photographers">Explore Talent</Link></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 outline-none">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} showCancel onCancel={handleCancelBooking} />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No pending requests.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 outline-none">
            {completedBookings.length > 0 ? (
              completedBookings.map((booking) => <ClientBookingCard key={booking.id} booking={booking} showReview />)
            ) : (
              <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Completed bookings will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ClientBookingCard({
  booking,
  showCancel = false,
  showReview = false,
  onCancel,
}: {
  booking: any;
  showCancel?: boolean;
  showReview?: boolean;
  onCancel?: (id: string) => void;
}) {
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "Awaiting Response",
    },
    confirmed: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Confirmed",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      label: "Completed",
    },
    accepted: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Accepted",
    },
    cancelled: {
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      label: "Cancelled",
    },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const dateFormatted = booking.start_time
    ? new Date(booking.start_time).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  const timeFormatted = booking.start_time
    ? new Date(booking.start_time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Time TBD";

  return (
    <div className="overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 sm:p-7 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight capitalize text-foreground">
              {booking.shoot_type || "Photography"} Session
            </h3>
            <Badge
              variant="outline"
              className={`${status.bg} ${status.color} font-bold uppercase tracking-wider px-2.5 py-0.5 text-[10px] rounded-full`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Photographer:{" "}
            <strong className="text-foreground font-bold">
              {booking.profiles?.full_name || "Photographer"}
            </strong>
          </p>
        </div>

        <div className="sm:text-right">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-primary">
            ₦{(Number(booking.total_price) || 0).toLocaleString()}
          </div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Total Cost
          </span>
        </div>
      </div>

      {/* Schedule & Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-sm">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/30">
          <div className="p-2 rounded-xl bg-background text-primary shrink-0 shadow-xs">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
              Session Date
            </span>
            <span className="font-bold text-foreground text-xs sm:text-sm truncate block">
              {dateFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/30">
          <div className="p-2 rounded-xl bg-background text-primary shrink-0 shadow-xs">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
              Time & Duration
            </span>
            <span className="font-bold text-foreground text-xs sm:text-sm truncate block">
              {timeFormatted} ({booking.duration_hours || 1} hrs)
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/30">
          <div className="p-2 rounded-xl bg-background text-primary shrink-0 shadow-xs">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
              Location
            </span>
            <span className="font-bold text-foreground text-xs sm:text-sm truncate block">
              {booking.location || "To be arranged"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          size="sm"
          variant="ghost"
          asChild
          className="rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-muted text-muted-foreground hover:text-foreground h-10 px-4"
        >
          <Link href={`/messages?to=${booking.photographer_id}`}>
            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
            Message Photographer
          </Link>
        </Button>

        <div className="flex items-center gap-2.5">
          {showCancel && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-4 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50"
              onClick={() => onCancel?.(booking.id)}
            >
              Cancel Request
            </Button>
          )}
          {showReview && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-4 border-border/60 hover:bg-muted"
            >
              Write Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
