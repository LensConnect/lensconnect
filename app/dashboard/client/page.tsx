"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Calendar,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Settings,
  MessageSquare,
  MapPin,
  Camera,
  Loader2,
  Briefcase,
  User,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

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

export default function ClientDashboardPage({onCancel}:{ onCancel?: (bookingId: string, status:string) => void;}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/get_booking_client?clientId=${user.id}`, {method: "GET", headers: {"Content-Type": "application/json"}})
      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        setBookings(data)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err)
      setBookings([])
    }
    setLoading(false)
  }


  useEffect(() => {
    if (user && user.role === "client") {
      fetchBookings();
    }
  }, [user]);


  const handleCancelBooking = async (bookingId: string, status: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;

    const response = await fetch('/api/bookings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status })
    })
    if (!response.ok) {
      toast.error('Failed to cancel booking')
      return
    }
    toast.success('Booking cancelled successfully')
    onCancel?.(bookingId,status)
    fetchBookings()

  }; 

  
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push("/login");
      else if (user.role === "photographer") router.push("/dashboard");
    }
  }, [user, isLoading, router]);

   
  if (isLoading || !user || user.role !== "client") return null;

  const upcomingBookings = Array.isArray(bookings) ? bookings.filter(
    (b) =>
      b.status === "confirmed" &&
      b.start_time &&
      new Date(b.start_time).getTime() > new Date().getTime()
  ) : [];
  const pendingBookings = Array.isArray(bookings) ? bookings.filter((b) => b.status === "pending") : [];
  const rejected = Array.isArray(bookings) ? bookings.filter((b)=> b.status === 'rejected') : [];
  const completedBookings = Array.isArray(bookings) ? bookings.filter((b) => b.status === "completed") : [];

  const totalSpent = completedBookings.reduce(
    (sum, b) => sum + (Number(b.total_price) || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Client Workspace
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Client Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.fullname}</span>. Manage your shoots, job posts, and creator bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              asChild
              className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5"
            >
              <Link href="/dashboard/client/post-job">
                <Plus className="h-3.5 w-3.5" />
                <span>Post a Job</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5"
            >
              <Link href="/photographers">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span>Find Photographers</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5"
            >
              <Link href="/dashboard/client/jobs">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span>My Jobs</span>
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
                <span>Profile</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Bento Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Total Bookings
              </span>
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {bookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">Lifetime shoot requests</p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Total investment</span>
              <span className="font-semibold text-foreground font-mono">₦{totalSpent.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Card 2: Upcoming */}
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
                <Clock className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {upcomingBookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">Confirmed active sessions</p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Ready on schedule</span>
            </div>
          </motion.div>

          {/* Card 3: Pending */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Awaiting Response
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {pendingBookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">Pending photographer review</p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Photographer action</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">Under review</span>
            </div>
          </motion.div>

          {/* Card 4: Completed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                Completed Shoots
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {completedBookings.length}
              </div>
              <p className="text-xs font-medium text-muted-foreground">Finished deliverables</p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Archive</span>
              <span className="text-muted-foreground font-semibold text-xs">Completed</span>
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
                  <span>Pending Requests</span>
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
                  <span>Archived</span>
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
                  <p className="text-xs font-medium text-muted-foreground">Loading your upcoming shoots...</p>
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {upcomingBookings.map((booking) => (
                    <ClientBookingCard 
                      key={booking.id}
                      booking={booking}
                      showCancel
                     
                    onCancel={handleCancelBooking}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Your Schedule is Open</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You do not have any confirmed upcoming photography sessions. Explore our curated talent to book your next shoot.
                    </p>
                  </div>
                  <Button asChild size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 gap-1.5">
                    <Link href="/photographers">
                      <Search className="h-3.5 w-3.5" />
                      <span>Find Photographers</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Pending */}
            <TabsContent value="pending" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="py-20 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading pending requests...</p>
                </div>
              ) : pendingBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                   {pendingBookings.map((booking) => (
                     <ClientBookingCard
                       key={booking.id}
                       booking={booking}
                       showCancel
                       onCancel={handleCancelBooking}
                     />
                   ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Pending Requests</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All your previous shoot requests have been answered by the respective photographers.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Completed */}
            <TabsContent value="completed" className="space-y-4 focus-visible:outline-none">
              {loading ? (
                <div className="py-20 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading archived shoots...</p>
                </div>
              ) : completedBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {completedBookings.map((booking) => (
                    <ClientBookingCard key={booking.id} booking={booking} showReview />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Completed Shoots Yet</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Completed shoots and deliverables will appear here for your records and review.
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

function ClientBookingCard({
  booking,
  showCancel = false,
  showReview = false,
  
  onCancel,
}: {
  booking: Booking;
  showCancel?: boolean;
  showReview?: boolean;
  onCancel?: (bookingId: string, status:string) => void;
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
  /*   accepted: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Accepted",
    }, */
    rejected: {
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      label: "Rejected",
    },
  };


  const handleCancelBooking = async (bookingId: string, status: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;

    const response = await fetch('/api/bookings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status })
    })
    if (!response.ok) {
      toast.error('Failed to cancel booking')
      return
    }
    toast.success('Booking cancelled successfully')
    onCancel?.(bookingId,status)

  }; 

  useEffect(()=>{
    handleCancelBooking(booking.id,'rejected');
  },[booking.id])


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

  const photographerName = booking.profiles?.full_name || "Photographer";

  

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 transition-all space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-foreground capitalize">
              {booking.shoot_type || "Photography"} Session
            </h3>
            <Badge
              variant="outline"
              className={`${status.bg} ${status.color} font-semibold px-2 py-0.5 text-[11px] rounded-full border`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
              {photographerName.charAt(0).toUpperCase()}
            </div>
            <span>
              Photographer: <strong className="text-foreground font-semibold">{photographerName}</strong>
            </span>
          </div>
        </div>

        <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-primary">
            ₦{(Number(booking.total_price) || 0).toLocaleString()}
          </div>
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Total Cost
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">Session Date</span>
            <span className="font-semibold text-foreground truncate block">{dateFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">Time & Duration</span>
            <span className="font-semibold text-foreground truncate block">
              {timeFormatted} ({booking.duration_hours || 1} hrs)
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

      {/* Message Note if present */}
      {booking.message && (
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground block mb-0.5">Booking Note:</span>
          <p className="italic text-foreground/80">"{booking.message}"</p>
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button
          size="sm"
          variant="outline"
          asChild
          className="rounded-xl text-xs font-semibold h-8.5 px-3 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Link href={`/messages?to=${booking.photographer_id}`}>
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Message Photographer</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {showCancel && booking.status !== "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold h-8.5 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
              onClick={() => onCancel?.(booking.id,'rejected')}
            >
              Cancel Request
            </Button>
          )}

          {showReview && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="rounded-xl text-xs font-semibold h-8.5 px-3 border-border/80 hover:bg-muted"
            >
              <Link href={`/photographer/review/${booking.photographer_id}`}>
                Write Review
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
