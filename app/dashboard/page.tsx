"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ImageIcon,
  Settings,
  MapPin,
  MessageSquare,
} from "lucide-react";


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

import { mockBookings, mockPhotographers } from "@/lib/mock-data";
import Link from "next/link";
import { toast } from "sonner";

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
      if (!user) {
        // Not logged in - redirect to login
        router.push("/login");
      } else if (user.role === "client") {
        // Wrong role - redirect to client dashboard
        router.push("/client-dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "photographer") {
    return null;
  }



  const handleUpdateStatus = async (id: string, newStatus: string) => {
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
  };

  const upcomingBookings = bookings.filter(
    (b) => (b.status === "confirmed" || b.status === "accepted") &&
      b.start_time && new Date(b.start_time).getTime() >= new Date().setHours(0, 0, 0, 0)
  );
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending"
  );
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  );

  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0
  );

  const thisMonthEarnings = completedBookings
    .filter((b) => {
      const bookingDate = new Date(b.start_time);
      const now = new Date();
      return bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Photographer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard/portfolio">
                <ImageIcon className="h-4 w-4 mr-2" />
                Manage Portfolio
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {completedBookings.length} completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${thisMonthEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Total for {new Date().toLocaleString('default', { month: 'long' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Availability
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Available</div>
              <p className="text-xs text-muted-foreground mt-1">
                Current Status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your response
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
                <PhotographerBookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={handleUpdateStatus}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <PhotographerBookingCard
                  key={booking.id}
                  booking={booking}
                  showActions
                  onStatusUpdate={handleUpdateStatus}
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
                <PhotographerBookingCard
                  key={booking.id}
                  booking={booking}
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

function PhotographerBookingCard({
  booking,
  showActions = false,
  onStatusUpdate,
}: {
  booking: Booking;
  showActions?: boolean;
  onStatusUpdate?: (id: string, status: string) => void;
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
    accepted: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Accepted",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Completed",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Cancelled",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Rejected",
    },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const durationLabel = booking.duration_hours ? `${booking.duration_hours} ${booking.duration_hours === 1 ? 'hour' : 'hours'}` : "N/A";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg capitalize">{booking.shoot_type}</h3>
                <p className="text-sm text-muted-foreground">
                  Client: {booking.profiles?.full_name || "Unknown Client"}
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
                  }) : "Time N/A"} ({durationLabel})
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
            {showActions && booking.status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onStatusUpdate?.(booking.id, "accepted")}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onStatusUpdate?.(booking.id, "rejected")}
                >
                  Decline
                </Button>
              </>
            )}
            {booking.status === "accepted" && (
              <Button
                size="sm"
                className="bg-primary"
                onClick={() => onStatusUpdate?.(booking.id, "completed")}
              >
                Mark as Completed
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent"
              asChild
            >
              <Link href={`/messages?to=${booking.client_id}`}>
                Message Client
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add MapPin import to the top of the file if needed, but I'll use MapPin if I see it's missing.
// Scanning imports... MapPin is MISSING in PhotographerDashboardPage imports.
// Wait, I should add MapPin to lucide-react imports.
