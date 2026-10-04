"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageSquare,
  UserRound,
  XCircle,
} from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";

type Booking = {
  id: string;
  client_id: string;
  photographer_id: string;
  start_time: string;
  duration_hours: number;
  status: "pending" | "confirmed" | "completed" | "rejected";
  total_price: number;
  shoot_type: string;
  location: string;
  message?: string;
  profiles?: { full_name?: string };
};

const formatMoney = (amount: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(amount);

function formatDate(dateTime: string) {
  const date = new Date(dateTime);
  return Number.isNaN(date.getTime())
    ? "Date not available"
    : new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatTime(dateTime: string) {
  const date = new Date(dateTime);
  return Number.isNaN(date.getTime())
    ? "Time not available"
    : new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(date);
}

export default function ClientDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/get_booking_client?clientId=${encodeURIComponent(user.id)}`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) throw new Error("Your bookings could not be loaded.");
      setBookings(data as Booking[]);
    } catch (error) {
      console.error("Failed to load client bookings:", error);
      setLoadError(error instanceof Error ? error.message : "Your bookings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === "client") void fetchBookings();
  }, [user, fetchBookings]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace("/login");
      else if (user.role === "photographer") router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Cancel this booking request?")) return;
    setUpdatingId(bookingId);
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "rejected" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "The booking request could not be cancelled.");
      toast.success("Booking request cancelled.");
      await fetchBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The booking request could not be cancelled.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !user || user.role !== "client") return null;

  const upcomingBookings = bookings.filter((booking) => booking.status === "confirmed");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const archiveBookings = bookings.filter((booking) => booking.status === "completed" || booking.status === "rejected");

  const renderContent = (items: Booking[], kind: "upcoming" | "pending" | "archive") => {
    if (loading) {
      return <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 border-b border-line px-5 py-16 text-center" role="status"><LoaderCircle className="size-6 animate-spin text-forest" aria-hidden="true" /><p className="text-sm text-muted-foreground">Loading your bookings…</p></div>;
    }
    if (loadError) {
      return <div className="flex min-h-[300px] flex-col items-start justify-center gap-3 border-b border-line px-5 py-12"><h3 className="font-serif text-2xl">Bookings unavailable</h3><p className="max-w-lg text-sm leading-6 text-muted-foreground">{loadError}</p><Button variant="outline" onClick={() => void fetchBookings()} className="min-h-11 rounded-none">Try again</Button></div>;
    }
    if (items.length) {
      return <div>{items.map((booking) => <ClientBooking key={booking.id} booking={booking} updating={updatingId === booking.id} onCancel={() => void handleCancel(booking.id)} />)}</div>;
    }

    const copy = kind === "upcoming"
      ? { title: "Your schedule is open", body: "Confirmed shoots will appear here with the photographer, date, time, location, and booking details." }
      : kind === "pending"
        ? { title: "No pending requests", body: "Booking requests awaiting a photographer’s response will appear here." }
        : { title: "No completed bookings", body: "Completed shoots and declined requests will remain here for reference." };

    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center border-b border-line px-5 py-16 text-center sm:min-h-[390px]">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full border border-line-strong text-forest"><CalendarDays className="size-6" aria-hidden="true" /></div>
        <h3 className="font-serif text-2xl leading-tight tracking-tight">{copy.title}</h3>
        <p className="mt-2 max-w-[420px] text-sm leading-6 text-muted-foreground">{copy.body}</p>
        {kind === "upcoming" && <>
          <Button asChild className="mt-6 min-h-11 rounded-none px-5 text-sm font-semibold"><Link href="/photographers">Find photographers<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          <Link href="/dashboard/client/post-job" className="mt-2 inline-flex min-h-11 items-center px-3 text-sm font-medium text-forest underline underline-offset-4 hover:text-forest-dark">Post a photography job</Link>
        </>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="mx-auto max-w-[1320px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div className="max-w-[680px]">
            <h1 className="font-serif text-[38px] leading-[1.04] tracking-[-0.05em] sm:text-5xl">Client dashboard</h1>
            <p className="mt-3 max-w-[570px] text-[15px] leading-7 text-muted-foreground">Keep track of your photographer requests, upcoming shoots, and past bookings.</p>
          </div>
          <Button asChild className="min-h-12 w-fit shrink-0 rounded-none px-5 text-sm font-semibold"><Link href="/photographers">Find photographers<ArrowUpRight className="size-4" aria-hidden="true" /></Link></Button>
        </section>

        <section className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-16 lg:pt-10" aria-label="Booking management">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-line-strong pb-4">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Your bookings</h2>
                <p className="mt-1 text-sm text-muted-foreground">Requests and shoots will appear here.</p>
              </div>
              <span className="text-[13px] text-muted-foreground">{bookings.length} {bookings.length === 1 ? "booking" : "bookings"}</span>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList aria-label="Booking status" className="flex h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-line bg-transparent p-0 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsTrigger value="upcoming" className="min-h-11 shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 text-sm font-medium text-muted-foreground shadow-none hover:text-forest data-[state=active]:border-forest data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-forest data-[state=active]:shadow-none">Upcoming <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-forest">{upcomingBookings.length}</span></TabsTrigger>
                <TabsTrigger value="pending" className="min-h-11 shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 text-sm font-medium text-muted-foreground shadow-none hover:text-forest data-[state=active]:border-forest data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-forest data-[state=active]:shadow-none">Pending requests <span className="rounded-full bg-wash px-2 py-0.5 text-xs text-muted-foreground">{pendingBookings.length}</span></TabsTrigger>
                <TabsTrigger value="archive" className="min-h-11 shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 text-sm font-medium text-muted-foreground shadow-none hover:text-forest data-[state=active]:border-forest data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-forest data-[state=active]:shadow-none">Completed archive <span className="rounded-full bg-wash px-2 py-0.5 text-xs text-muted-foreground">{archiveBookings.length}</span></TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-0 focus-visible:outline-none">{renderContent(upcomingBookings, "upcoming")}</TabsContent>
              <TabsContent value="pending" className="mt-0 focus-visible:outline-none">{renderContent(pendingBookings, "pending")}</TabsContent>
              <TabsContent value="archive" className="mt-0 focus-visible:outline-none">{renderContent(archiveBookings, "archive")}</TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-8 lg:pt-1">
            <section className="border-t border-line-strong pt-4">
              <h2 className="text-[17px] font-semibold tracking-tight">Quick links</h2>
              <nav aria-label="Client workspace links" className="mt-3 divide-y divide-line border-y border-line">
                <QuickLink href="/photographers" label="Find photographers" />
                <QuickLink href="/dashboard/client/post-job" label="Post a job" />
                <QuickLink href="/dashboard/client/jobs" label="My jobs" />
                <QuickLink href="/profile" label="Profile settings" />
              </nav>
            </section>
            <section className="border-t border-line-strong pt-4">
              <h2 className="text-[17px] font-semibold tracking-tight">Booking details</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Each request keeps the shoot type, date, time, location, duration, total, and your message together.</p>
              <p className="mt-3 text-[13px] leading-5 text-muted-foreground">A pending request can be cancelled or continued by message. Its status remains visible in your request history.</p>
            </section>
          </aside>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="w-fit font-semibold tracking-[-0.05em] text-ink">lensconnect</Link>
          <p>© 2026 LensConnect</p>
          <Link href="/messages" className="w-fit text-muted-foreground hover:text-forest">Messages</Link>
        </div>
      </footer>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="group flex min-h-14 items-center justify-between gap-3 text-sm text-[#40453f] transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><span>{label}</span><ArrowUpRight className="size-4 text-forest transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></Link>;
}

function ClientBooking({ booking, updating, onCancel }: { booking: Booking; updating: boolean; onCancel: () => void }) {
  const statusLabel = booking.status === "pending" ? "Pending" : booking.status === "confirmed" ? "Confirmed" : booking.status === "completed" ? "Completed" : "Declined";
  const statusTone = booking.status === "pending" ? "text-[#765829]" : booking.status === "confirmed" ? "text-forest" : booking.status === "completed" ? "text-muted-foreground" : "text-[#8c352b]";
  const photographerName = booking.profiles?.full_name || "Photographer";

  return (
    <article className="border-b border-line py-6 sm:py-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`inline-flex items-center gap-2 text-[13px] font-semibold ${statusTone}`}>
            {booking.status === "rejected" ? <XCircle className="size-4" aria-hidden="true" /> : booking.status === "completed" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : booking.status === "confirmed" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Clock3 className="size-4" aria-hidden="true" />}
            {statusLabel}
          </p>
          <h3 className="mt-2 break-words font-serif text-2xl tracking-tight">{booking.shoot_type || "Photography"} session</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="size-4" aria-hidden="true" />Photographer: <span className="font-medium text-ink">{photographerName}</span></p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formatMoney(Number(booking.total_price) || 0)}</p>
          <p className="text-xs text-muted-foreground">Booking total</p>
        </div>
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div><dt className="text-[13px] text-muted-foreground">Date &amp; time</dt><dd className="mt-1 font-medium">{formatDate(booking.start_time)} · {formatTime(booking.start_time)}</dd></div>
        <div><dt className="text-[13px] text-muted-foreground">Duration</dt><dd className="mt-1 font-medium">{booking.duration_hours || 1} {booking.duration_hours === 1 ? "hour" : "hours"}</dd></div>
        <div><dt className="text-[13px] text-muted-foreground">Location</dt><dd className="mt-1 flex items-start gap-1.5 font-medium"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{booking.location || "To be arranged"}</span></dd></div>
      </dl>
      {booking.message && <div className="mt-4 border-t border-line pt-4"><p className="text-[13px] font-medium text-muted-foreground">Project notes</p><p className="mt-1 whitespace-pre-line text-sm leading-6">{booking.message}</p></div>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Link href={`/messages?to=${booking.photographer_id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest underline underline-offset-4 hover:text-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><MessageSquare className="size-4" aria-hidden="true" />Message photographer</Link>
        <div className="flex flex-wrap items-center gap-2">
          {booking.status !== "rejected" && booking.status !== "completed" && <Button type="button" variant="outline" disabled={updating} onClick={onCancel} className="min-h-11 rounded-none border-line-strong px-4 text-sm font-semibold text-[#6c3b31] hover:bg-[#f8f3f0]">{updating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}Cancel request</Button>}
          {booking.status === "completed" && <Button asChild type="button" variant="outline" className="min-h-11 rounded-none border-line-strong px-4 text-sm font-semibold"><Link href={`/photographer/review/${booking.photographer_id}`}>Write a review</Link></Button>}
        </div>
      </div>
    </article>
  );
}
