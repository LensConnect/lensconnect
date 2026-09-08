"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  Camera,
  Loader2,
  Plus,
  Briefcase,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";

type Booking = {
  id: string;
  clientId: string;
  photographerId: string;
  startTime: string;
  startDate: string;
  durationHours: number;
  status: "pending" | "confirmed" | "completed"  | "rejected";
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
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status: newStatus }),
      });

      if (!response.ok) {
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
      (b.status === "confirmed") &&
      b.startDate &&
      new Date(b.startDate).getTime() >= new Date().setHours(0, 0, 0, 0)
  );
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const rejected = bookings.filter((b)=> b.status === 'rejected').length;
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
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Modern Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Creator Studio
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Photographer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.fullname}</span>. Monitor shoots, inquiries, and revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5"
            >
              <Link href="/dashboard/portfolio">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>Portfolio</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5"
            >
              <Link href="/photographer/find-jobs">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Find Jobs</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5"
            >
              <Link href="/profile">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Profile Settings</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Bento Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Total Revenue
              </span>
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                ₦{totalEarnings.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>+₦{thisMonthEarnings.toLocaleString()} this month</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Earnings from completed bookings</span>
              <span className="font-semibold text-foreground">{completedBookings.length} shoots</span>
            </div>
          </motion.div>

          {/* Card 2: Upcoming Shoots */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Upcoming Shoots
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {upcomingBookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Confirmed sessions on your calendar
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Pending inquiries awaiting you</span>
              <Badge variant="secondary" className="rounded-full px-2 py-0.2 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                {pendingBookings.length} pending
              </Badge>
            </div>
          </motion.div>

          {/* Card 3: Completed Projects */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Completed Deliveries
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {completedBookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Milestones completed & archived
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Client satisfaction archive</span>
              <span className="text-primary font-semibold text-xs">100% Verified</span>
            </div>
          </motion.div>
        </section>

        {/* Bookings Section with Clean Segmented Tabs */}
        <section className="space-y-6">
          <Tabs defaultValue="upcoming" className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
              <TabsList className="bg-card border border-border/80 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
                <TabsTrigger
                  value="upcoming"
                  className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Upcoming Shoots</span>
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px] font-bold bg-background">
                    {upcomingBookings.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="pending"
                  className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Inquiries</span>
                  {pendingBookings.length > 0 && (
                    <span className="px-1.5 py-0 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      {pendingBookings.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="completed"
                  className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Completed</span>
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px] font-bold bg-background">
                    {completedBookings.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="text-xs text-muted-foreground font-medium hidden sm:block">
                Showing {bookings.length} total bookings
              </div>
            </div>

            {/* Tab 1: Upcoming */}
            <TabsContent value="upcoming" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="py-20 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading upcoming shoots...</p>
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {upcomingBookings.map((booking) => (
                    <PhotographerBookingCard
                      key={booking.id}
                      booking={booking}
                      onStatusUpdate={handleUpdateStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Upcoming Shoots</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Confirmed client bookings will appear here. Browse open jobs or optimize your portfolio to get discovered.
                    </p>
                  </div>
                  <Button asChild size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 gap-1.5">
                    <Link href="/photographer/find-jobs">
                      <Search className="h-3.5 w-3.5" />
                      <span>Browse Open Jobs</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Pending Inquiries */}
            <TabsContent value="pending" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="py-20 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading inquiries...</p>
                </div>
              ) : pendingBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {pendingBookings.map((booking) => (
                    <PhotographerBookingCard
                      key={booking.id}
                      booking={booking}
                      showActions
                      onStatusUpdate={handleUpdateStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Inbox is Clear</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You have responded to all client booking requests. New incoming requests will appear here for review.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Completed Shoots */}
            <TabsContent value="completed" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="py-20 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading archive...</p>
                </div>
              ) : completedBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {completedBookings.map((booking) => (
                    <PhotographerBookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Completed Shoots Yet</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Shoots marked as complete will be safely archived here for your records and accounting.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
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

  async function fetchBookingByStatus(bookingId: string, status: string) {
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status, bookingId: bookingId }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      toast.success(`Booking ${status} successfully`);
      if (onStatusUpdate) onStatusUpdate(bookingId, status);
      return data;
    } catch (e: any) {
      toast.error(e.message || "Could not update status");
    }
  }

  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      badgeText: "Awaiting Review",
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

  const bookingDate = booking.startDate ? new Date(booking.startDate) : null;
  const isDateValid = bookingDate && !isNaN(bookingDate.getTime());
  const dateFormatted = isDateValid
    ? format(bookingDate, "EEE, MMM d, yyyy")
    : "Date TBD";

  const dateBadge = isDateValid
    ? isToday(bookingDate)
      ? "Today"
      : isTomorrow(bookingDate)
      ? "Tomorrow"
      : null
    : null;

  const durationLabel = booking.durationHours
    ? `${booking.durationHours} ${booking.durationHours === 1 ? "hr" : "hrs"}`
    : "Flexible";

  const clientInitial = (booking.client_name || "C").charAt(0).toUpperCase();

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 transition-all space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-foreground capitalize">
              {booking.type || "Photography"} Session
            </h3>

            <Badge
              variant="outline"
              className={`${status.bg} ${status.color} font-semibold px-2 py-0.5 text-[11px] rounded-full border`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.badgeText}
            </Badge>

            {dateBadge && (
              <Badge className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-[10px] rounded-full">
                {dateBadge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
              {clientInitial}
            </div>
            <span>
              Client: <strong className="text-foreground font-semibold">{booking.client_name || "Client"}</strong>
            </span>
          </div>
        </div>

        <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-primary">
            ₦{(Number(booking.totalPrice) || 0).toLocaleString()}
          </div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Total Revenue
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">Date</span>
            <span className="font-semibold text-foreground truncate block">{dateFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">Time & Duration</span>
            <span className="font-semibold text-foreground truncate block">
              {booking.startTime || "TBD"} ({durationLabel})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">Location</span>
            <span className="font-semibold text-foreground truncate block">
              {booking.location || "To be arranged"}
            </span>
          </div>
        </div>
      </div>

      {/* Client Note / Message (Collapsible) */}
      {booking.messages && (
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Client Instructions & Notes</span>
            {booking.messages.length > 80 && (
              <button
                type="button"
                onClick={() => setShowFullNote(!showFullNote)}
                className="flex items-center gap-0.5 text-primary hover:underline text-[10px] font-bold"
              >
                {showFullNote ? "Less" : "Read more"}
                {showFullNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
          <p className={`text-xs text-foreground/80 leading-relaxed ${showFullNote ? "" : "line-clamp-2"}`}>
            "{booking.messages}"
          </p>
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl text-xs font-semibold h-8.5 px-3 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Link href={`/messages?to=${booking.clientId}`}>
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Message Client</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {showActions && booking.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchBookingByStatus(booking.id, "rejected")}
                className="rounded-xl text-xs font-semibold h-8.5 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
              >
                <X className="h-3 w-3 mr-1" />
                <span>Decline</span>
              </Button>
              <Button
                size="sm"
                onClick={() => fetchBookingByStatus(booking.id, "confirmed")}
                className="rounded-xl text-xs font-bold h-8.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                <span>Accept Booking</span>
              </Button>
            </>
          )}

          {booking.status === "confirmed" && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate?.(booking.id, "completed")}
              className="rounded-xl text-xs font-bold h-8.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Completed</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
