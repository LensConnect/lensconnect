"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

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
      if (!user) {
        // Not logged in - redirect to login
        router.push("/login");
      } else if (user.role === "photographer") {
        // Wrong role - redirect to photographer dashboard
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel and delete this booking?")) {
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
      return;
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success("Booking cancelled successfully");
    fetchBookings();
  };

  if (isLoading || !user || user.role !== "client") {
    return null;
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && b.start_time && new Date(b.start_time).getTime() > new Date().getTime()
  );
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-primary">
              <Link href="/photographers">
                <Search className="h-4 w-4 mr-2" />
                Find Photographers
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/client-dashboard/favorites">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/client-dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingBookings.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedBookings.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Finished sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <ClientBookingCard
                  key={booking.id}
                  booking={booking}
                  showCancel
                  onCancel={handleCancelBooking}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No upcoming bookings
                </p>
                <Button asChild>
                  <Link href="/photographers">Find a Photographer</Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <ClientBookingCard
                  key={booking.id}
                  booking={booking}
                  showCancel
                  onCancel={handleCancelBooking}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length > 0 ? (
              completedBookings.map((booking) => (
                <ClientBookingCard
                  key={booking.id}
                  booking={booking}
                  showReview
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No completed bookings yet
                </p>
              </Card>
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
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      label: "Pending",
    },
    confirmed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Confirmed",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Completed",
    },
    accepted: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Accepted",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Cancelled",
    },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg capitalize">{booking.shoot_type}</h3>
                <p className="text-sm text-muted-foreground">
                  Photographer: {booking.profiles?.full_name || "Unknown Photographer"}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {booking.location}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`${status.bg} ${status.color} border-0`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.start_time ? new Date(booking.start_time).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : "Date N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.start_time ? new Date(booking.start_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  }) : "Time N/A"} ({booking.duration_hours} {booking.duration_hours === 1 ? 'hour' : 'hours'})
                </span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-primary">
                ${booking.total_price || 0}
              </div>
            </div>

            {booking.message && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md italic">
                "{booking.message}"
              </p>
            )}
          </div>

          <div className="flex md:flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 md:flex-none bg-transparent"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            {showCancel && (
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 md:flex-none"
                onClick={() => onCancel?.(booking.id)}
              >
                Cancel
              </Button>
            )}
            {showReview && (
              <Button size="sm" className="flex-1 md:flex-none">
                Leave Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
