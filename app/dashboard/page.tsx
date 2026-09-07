"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ImageIcon,
  Settings,
  MapPin,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Check,
  X,
  Sparkles,
  Camera,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";

type Booking = {
  id: string;
  clientId: string;
  photographerId: string;
  startTime: string;
  startDate: string;
  durationHours: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "accepted" | "rejected";
  totalPrice: number;
  type: string;
  location: string;
  messages: string;
  createdAt?: string;
  client_name?: string;
};

export default function PhotographerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/get_bookings_photographerId?photographerId=${user.id}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) {
        toast.error("Failed to fetch bookings");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("An error occurred while loading bookings");
    } finally {
      setLoading(false);
    }
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
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
        return;
      }
      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (err) {
      toast.error("Could not update status");
    }
  };
 
  

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "accepted") &&
      b.startDate &&
      new Date(b.startDate).getTime() >= new Date().setHours(0, 0, 0, 0)
  );
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0),
    0
  );
  const thisMonthEarnings = completedBookings
    .filter((b) => {
      if (!b.startDate) return false;
      const bookingDate = new Date(b.startDate);
      const now = new Date();
      return (
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white font-sans">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <Header />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-[1400px]">
        {/* Cinematic Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Photographer Portal
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">
              Welcome back, <span className="text-foreground font-bold">{user.fullname}</span>. Manage your shoots, inquiries, and revenue.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-full h-11 px-5 border-border/60 hover:bg-muted font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Link href="/dashboard/portfolio">
                <ImageIcon className="h-4 w-4 mr-2 text-primary" /> Portfolio Manager
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full h-11 px-5 border-border/60 hover:bg-muted font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" /> Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-7 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all shadow-xs relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Total Earnings (YTD)
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                ₦
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-2">
              ₦{totalEarnings.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+₦{thisMonthEarnings.toLocaleString()} this month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-7 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all shadow-xs relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Upcoming Shoots
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-2">
              {upcomingBookings.length}
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              {pendingBookings.length} pending request{pendingBookings.length === 1 ? "" : "s"} awaiting review
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-7 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all shadow-xs relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Completed Projects
              </h3>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-2">
              {completedBookings.length}
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              Delivered clients & completed milestones
            </p>
          </motion.div>
        </div>

        {/* Elegant Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-transparent border-b border-border/40 rounded-none w-full justify-start h-auto p-0 gap-6 sm:gap-8 overflow-x-auto">
            <TabsTrigger
              value="upcoming"
              className="text-base sm:text-lg font-bold tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground transition-all flex items-center gap-2"
            >
              Upcoming Shoots
              <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {upcomingBookings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-base sm:text-lg font-bold tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground transition-all flex items-center gap-2"
            >
              Pending Inquiries
              <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                {pendingBookings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-base sm:text-lg font-bold tracking-tight data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground transition-all flex items-center gap-2"
            >
              Completed Shoots
              <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                {completedBookings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Loading upcoming bookings...</p>
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <PhotographerBookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={handleUpdateStatus}
                />
              ))
            ) : (
              <div className="py-20 text-center rounded-3xl bg-secondary/10 border-2 border-dashed border-border/50 space-y-3">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-lg font-bold text-foreground">No upcoming shoots scheduled</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                  New confirmed client bookings will appear here. Keep your profile and portfolio updated to attract more clients.
                </p>
                <Button asChild className="rounded-full font-bold text-xs uppercase tracking-wider mt-2">
                  <Link href="/photographer/find-jobs">Browse Open Jobs</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 outline-none">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Loading inquiries...</p>
              </div>
            ) : pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <PhotographerBookingCard
                  key={booking.id}
                  booking={booking}
                  showActions
                  onStatusUpdate={handleUpdateStatus}
                />
              ))
            ) : (
              <div className="py-20 text-center rounded-3xl bg-secondary/10 border-2 border-dashed border-border/50 space-y-3">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-lg font-bold text-foreground">Inbox zero</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  You have answered all incoming client requests.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 outline-none">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Loading completed bookings...</p>
              </div>
            ) : completedBookings.length > 0 ? (
              completedBookings.map((booking) => (
                <PhotographerBookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="py-20 text-center rounded-3xl bg-secondary/10 border-2 border-dashed border-border/50 space-y-3">
                <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-lg font-bold text-foreground">No completed bookings yet</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  Shoots marked as complete will be archived here for your records and earnings history.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PhotographerBookingCard({
  booking,
  showActions = false,
  onStatusUpdate,
}: {
  booking: Booking;
  showActions?: boolean;
  onStatusUpdate?: (id: string, status: string) => void;
}) {
  const [showFullNote, setShowFullNote] = useState(false);

  async function fetchBookingByStatus(bookingId: string,status: string) {
    const response = await fetch('/api/bookings', { method: 'PATCH', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status, bookingId:bookingId }) })
    if (!response.ok) throw new Error("Failed to fetch bookings")
    const data = await response.json()
    return data
  }

  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      badgeText: "Awaiting Your Review",
    },
    confirmed: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      badgeText: "Confirmed Shoot",
    },
    accepted: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      badgeText: "Accepted Shoot",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      badgeText: "Completed",
    },
    cancelled: {
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      badgeText: "Cancelled",
    },
    rejected: {
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      badgeText: "Declined",
    },
  };

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Format date and compute relative badges
  const bookingDate = booking.startDate ? new Date(booking.startDate) : null;
  const isDateValid = bookingDate && !isNaN(bookingDate.getTime());
  const dateFormatted = isDateValid
    ? format(bookingDate, "EEEE, MMMM d, yyyy")
    : "Date to be agreed";

  const dateBadge = isDateValid
    ? isToday(bookingDate)
      ? "Today"
      : isTomorrow(bookingDate)
      ? "Tomorrow"
      : null
    : null;

  // Format time window
  const durationLabel = booking.durationHours
    ? `${booking.durationHours} ${booking.durationHours === 1 ? "hour" : "hours"}`
    : "Flexible duration";

  const clientInitial = (booking.client_name || "C").charAt(0).toUpperCase();

  return (
    <Card className="overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all duration-300 rounded-3xl">
      <CardContent className="p-6 sm:p-7 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Camera className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight capitalize text-foreground">
                {booking.type} Session
              </h3>
              <Badge
                variant="outline"
                className={`${status.bg} ${status.color} font-bold uppercase tracking-wider px-2.5 py-0.5 text-[10px] rounded-full`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.badgeText}
              </Badge>
              {dateBadge && (
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground font-black uppercase tracking-wider px-2.5 py-0.5 text-[10px] rounded-full animate-pulse"
                >
                  {dateBadge}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                {clientInitial}
              </div>
              <span>
                Client: <strong className="text-foreground font-bold">{booking.client_name || "Client"}</strong>
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-primary">
              ₦{(Number(booking.totalPrice) || 0).toLocaleString()}
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Total Revenue
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
                {booking.startTime || "TBD"} ({durationLabel})
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="p-2 rounded-xl bg-background text-primary shrink-0 shadow-xs">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Shoot Location
              </span>
              <span className="font-bold text-foreground text-xs sm:text-sm truncate block">
                {booking.location || "Remote / To be agreed"}
              </span>
            </div>
          </div>
        </div>

        {/* Client Note / Message (Collapsible) */}
        {booking.messages && (
          <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="uppercase tracking-wider text-[10px]">Client Instructions & Notes</span>
              {booking.messages.length > 100 && (
                <button
                  type="button"
                  onClick={() => setShowFullNote(!showFullNote)}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {showFullNote ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Read More</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
            <p className={`text-sm text-foreground/80 font-medium italic leading-relaxed ${showFullNote ? "" : "line-clamp-2"}`}>
              "{booking.messages}"
            </p>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-muted text-muted-foreground hover:text-foreground h-10 px-4"
          >
            <Link href={`/messages?to=${booking.clientId}`}>
              <MessageSquare className="h-4 w-4 mr-2 text-primary" />
              Message Client
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            {showActions && booking.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                 /*  onClick={() => onStatusUpdate?.(booking.id, "rejected")} */
                 onClick={() => fetchBookingByStatus(booking.id,"rejected")}
                  className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-4 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => fetchBookingByStatus(booking.id, "confirmed")}
                  className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Accept Booking
                </Button>
              </>
            )}

            {(booking.status === "confirmed" || booking.status === "accepted") && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate?.(booking.id, "completed")}
                className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Mark Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

