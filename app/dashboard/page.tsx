"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  MessageSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

type BookingStatus = "pending" | "confirmed" | "completed" | "rejected";
type Booking = {
  id: string;
  clientId: string;
  photographerId: string;
  startTime: string;
  startDate: string;
  durationHours: number;
  status: BookingStatus;
  totalPrice: number;
  type: string;
  location: string;
  messages: string;
  client_name?: string;
};

type BookingAction = "confirmed" | "rejected" | "completed";

const money = (amount: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(amount);

function formatDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  return dateValue && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(date)
    : "Date not available";
}

function formatTime(timeValue: string) {
  if (!timeValue) return "Time not available";
  const date = new Date(`1970-01-01T${timeValue}`);
  return Number.isNaN(date.getTime())
    ? timeValue
    : new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(date);
}

function isUpcoming(booking: Booking) {
  if (!booking.startDate) return false;
  const date = new Date(`${booking.startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date >= today;
}

export default function PhotographerDashboardPage() {
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
      const profileResponse = await fetch(`/api/profiles?userId=${encodeURIComponent(user.id)}`);
      const profileData = await profileResponse.json();
      const photographerProfileId = profileData.result?.photographerProfileId;
      if (!profileResponse.ok || !photographerProfileId) {
        throw new Error("Complete your photographer profile to view booking requests.");
      }
      const response = await fetch(`/api/get_bookings_photographerId?photographerId=${encodeURIComponent(String(photographerProfileId))}`);
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.data)) throw new Error(result.error || "Your booking requests could not be loaded.");
      setBookings(result.data as Booking[]);
    } catch (error) {
      console.error("Failed to load photographer bookings:", error);
      setLoadError(error instanceof Error ? error.message : "Your booking requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === "photographer") void fetchBookings();
  }, [user, fetchBookings]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.replace("/login");
      else if (user.role === "client") router.replace("/dashboard/client");
    }
  }, [user, authLoading, router]);

  const updateBookingStatus = async (bookingId: string, status: BookingAction) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "Could not update this booking.");
      const actionLabel = status === "confirmed" ? "Booking confirmed." : status === "rejected" ? "Request declined." : "Shoot marked complete.";
      toast.success(actionLabel);
      await fetchBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !user || user.role !== "photographer") return null;

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const upcomingBookings = bookings.filter((booking) => booking.status === "confirmed" && isUpcoming(booking));
  const completedBookings = bookings.filter((booking) => booking.status === "completed");
  const primaryRequest = pendingBookings[0];
  const otherPending = pendingBookings.slice(1);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-9 sm:px-8 sm:pt-12">
        <section className="mb-9 flex flex-col justify-between gap-6 border-b border-line pb-7 md:flex-row md:items-end">
          <div className="max-w-[680px]">
            <h1 className="font-serif text-[36px] leading-[1.04] tracking-[-0.05em] sm:text-[46px]">Photographer dashboard</h1>
            <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-muted-foreground">Review client requests, confirm upcoming work, and return to completed shoots when needed.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" asChild className="min-h-[46px] rounded-none border-line-strong bg-transparent px-4 text-sm font-semibold">
              <Link href="/photographer/find-jobs"><Search className="size-4" aria-hidden="true" />Find jobs</Link>
            </Button>
            <Button asChild className="min-h-[46px] rounded-none px-4 text-sm font-semibold">
              <Link href="/dashboard/portfolio"><ImageIcon className="size-4" aria-hidden="true" />Portfolio</Link>
            </Button>
          </div>
        </section>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.78fr)] lg:gap-14">
          <section aria-labelledby="pending-heading" className="min-w-0">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="pending-heading" className="font-serif text-[26px] tracking-tight sm:text-[30px]">Pending requests</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Booking requests awaiting your response.</p>
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">{pendingBookings.length} {pendingBookings.length === 1 ? "request" : "requests"}</span>
            </div>

            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 border border-line bg-white px-5 text-center" role="status"><LoaderCircle className="size-6 animate-spin text-forest" aria-hidden="true" /><p className="text-sm text-muted-foreground">Loading booking requests…</p></div>
            ) : loadError ? (
              <div className="flex min-h-[260px] flex-col items-start justify-center gap-3 border border-line bg-white px-6 py-10"><h3 className="font-serif text-2xl">Requests unavailable</h3><p className="text-sm leading-6 text-muted-foreground">{loadError}</p><Button variant="outline" onClick={() => void fetchBookings()} className="min-h-11 rounded-none">Try again</Button></div>
            ) : primaryRequest ? (
              <>
                <PendingRequest booking={primaryRequest} busy={updatingId === primaryRequest.id} onUpdate={updateBookingStatus} />
                {otherPending.length > 0 && <div className="mt-8"><h3 className="border-b border-line-strong pb-3 text-[17px] font-semibold">Other pending requests <span className="ml-1 text-sm font-normal text-muted-foreground">{otherPending.length}</span></h3><div>{otherPending.map((booking) => <CompactRequest key={booking.id} booking={booking} busy={updatingId === booking.id} onUpdate={updateBookingStatus} />)}</div></div>}
              </>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-line-strong bg-wash px-6 py-12 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-line-strong text-muted-foreground"><CheckCircle2 className="size-5" aria-hidden="true" /></div>
                <h3 className="font-serif text-2xl">No pending requests</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">New booking requests will appear here for you to review.</p>
                <Link href="/profile" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest underline underline-offset-4">Update your profile<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
              </div>
            )}
          </section>

          <aside className="min-w-0 space-y-9 lg:pt-[2px]">
            <section aria-labelledby="upcoming-heading">
              <div className="flex items-baseline justify-between gap-3 border-b border-line-strong pb-3">
                <h2 id="upcoming-heading" className="font-serif text-xl font-medium tracking-tight">Upcoming confirmed shoots</h2>
                <span className="shrink-0 text-[13px] font-medium text-muted-foreground">{upcomingBookings.length}</span>
              </div>
              {upcomingBookings.length ? <div>{upcomingBookings.map((booking) => <MiniBooking key={booking.id} booking={booking} status="Confirmed" />)}</div> : <p className="border-b border-line py-4 text-sm leading-6 text-muted-foreground">Confirmed future shoots will appear here.</p>}
              <Link href="/messages" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest hover:underline hover:underline-offset-4">Open messages<ArrowRight className="size-4" aria-hidden="true" /></Link>
            </section>

            <section aria-labelledby="completed-heading">
              <div className="flex items-baseline justify-between gap-3 border-b border-line-strong pb-3">
                <h2 id="completed-heading" className="font-serif text-xl font-medium tracking-tight">Completed shoots</h2>
                <span className="shrink-0 text-[13px] font-medium text-muted-foreground">{completedBookings.length}</span>
              </div>
              {completedBookings.length ? <div>{completedBookings.map((booking) => <MiniBooking key={booking.id} booking={booking} status="Completed" />)}</div> : <p className="border-b border-line py-4 text-sm leading-6 text-muted-foreground">Completed shoots remain available here for reference.</p>}
              <p className="mt-3 text-[13px] leading-5 text-muted-foreground">Past requests remain available here for reference.</p>
            </section>

            <nav aria-label="Photographer workspace" className="border-t border-line-strong pt-5">
              <h2 className="text-[13px] font-semibold text-muted-foreground">Workspace</h2>
              <div className="mt-2 divide-y divide-line">
                <WorkspaceLink href="/dashboard/portfolio" icon={<ImageIcon className="size-4" aria-hidden="true" />} label="Portfolio" />
                <WorkspaceLink href="/photographer/find-jobs" icon={<Search className="size-4" aria-hidden="true" />} label="Find jobs" />
                <WorkspaceLink href="/applications" icon={<CheckCircle2 className="size-4" aria-hidden="true" />} label="Applications" />
                <WorkspaceLink href="/profile" icon={<UserRound className="size-4" aria-hidden="true" />} label="Profile" />
                <WorkspaceLink href="/messages" icon={<MessageSquare className="size-4" aria-hidden="true" />} label="Messages" />
              </div>
            </nav>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PendingRequest({ booking, busy, onUpdate }: { booking: Booking; busy: boolean; onUpdate: (id: string, status: BookingAction) => Promise<void> }) {
  return (
    <article aria-label="Pending booking request" className="border border-line-strong bg-white">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-muted-foreground">Client</p>
            <h3 className="mt-1 break-words text-[22px] font-semibold tracking-tight sm:text-[25px]">{booking.client_name || "Client"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{booking.type || "Photography"} session</p>
          </div>
          <span className="inline-flex min-h-[34px] shrink-0 items-center gap-2 border border-[#d5c9a9] bg-[#f5f1e7] px-3 text-[13px] font-semibold text-[#5d4c28]"><span className="size-2 rounded-full bg-[#8a6b2b]" aria-hidden="true" />Pending</span>
        </div>
        <dl className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2">
          <Detail label="Date & time" value={`${formatDate(booking.startDate)} · ${formatTime(booking.startTime)}`} />
          <Detail label="Location" value={booking.location || "Not provided"} />
          <Detail label="Duration" value={`${booking.durationHours || 1} ${(booking.durationHours || 1) === 1 ? "hour" : "hours"}`} />
          <Detail label="Total" value={money(Number(booking.totalPrice) || 0)} strong />
        </dl>
        {booking.messages && <div className="border-t border-line pt-4"><p className="text-[13px] font-medium text-muted-foreground">Client notes</p><p className="mt-1 whitespace-pre-line text-sm leading-6">{booking.messages}</p></div>}
        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/messages?to=${booking.clientId}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest underline underline-offset-4 decoration-line-strong hover:decoration-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><MessageSquare className="size-4" aria-hidden="true" />Message client</Link>
          <div className="grid grid-cols-1 gap-2 sm:flex">
            <Button type="button" disabled={busy} onClick={() => void onUpdate(booking.id, "confirmed")} className="min-h-12 rounded-none px-5 text-sm font-semibold">{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}Confirm booking</Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => void onUpdate(booking.id, "rejected")} className="min-h-12 rounded-none border-line-strong px-5 text-sm font-semibold text-[#6c3b31] hover:bg-[#f8f3f0]">{busy ? null : <X className="size-4" aria-hidden="true" />}Decline request</Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactRequest({ booking, busy, onUpdate }: { booking: Booking; busy: boolean; onUpdate: (id: string, status: BookingAction) => Promise<void> }) {
  return <article className="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h4 className="font-semibold">{booking.client_name || "Client"} · {booking.type || "Photography"}</h4><p className="mt-1 text-sm text-muted-foreground">{formatDate(booking.startDate)} · {booking.location || "Location not provided"}</p></div><div className="flex gap-2"><Button type="button" disabled={busy} variant="outline" onClick={() => void onUpdate(booking.id, "rejected")} className="min-h-11 rounded-none">Decline</Button><Button type="button" disabled={busy} onClick={() => void onUpdate(booking.id, "confirmed")} className="min-h-11 rounded-none">Confirm</Button></div></article>;
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="min-w-0"><dt className="text-[13px] font-medium text-muted-foreground">{label}</dt><dd className={`mt-1 break-words text-[15px] ${strong ? "font-semibold" : "font-medium"}`}>{value}</dd></div>;
}

function MiniBooking({ booking, status }: { booking: Booking; status: string }) {
  return <article className="border-b border-line py-4"><p className="text-[13px] font-semibold text-forest">{status} · {booking.client_name || "Client"}</p><h3 className="mt-1 text-[15px] font-semibold">{booking.type || "Photography"} session</h3><p className="mt-2 text-sm leading-5 text-muted-foreground">{formatDate(booking.startDate)} · {formatTime(booking.startTime)} · {booking.durationHours || 1} hr</p><p className="mt-1 break-words text-sm leading-5 text-muted-foreground">{booking.location || "Location not provided"}</p></article>;
}

function WorkspaceLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return <Link href={href} className="group flex min-h-12 items-center justify-between gap-3 text-sm font-medium transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><span className="flex items-center gap-2.5">{icon}{label}</span><ArrowUpRight className="size-4" aria-hidden="true" /></Link>;
}
