"use client";

import { notFound } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";

import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";

type PhotographerProfile = {
  id: number;
  userId: number;
  fullname: string;
  email?: string;
  role?: string;
  profile_image_url?: string;
  location?: string;
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  specialties?: string[];
  availability?: boolean;
  website?: string;
};

type PortfolioItem = {
  id: number | string;
  title: string;
  description?: string;
  location?: string;
  category?: string[];
  image_url: string[] | string;
};

type GallerySlide = {
  src: string;
  alt: string;
  title: string;
  description?: string;
  location?: string;
  category?: string[];
};

type BookingFields = {
  startDate: string;
  startTime: string;
  durationHours: string;
  type: string;
  location: string;
  message: string;
};

type BookingErrors = Partial<Record<keyof BookingFields, string>>;

const money = (amount: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(amount);

function imagesFor(item: PortfolioItem) {
  return Array.isArray(item.image_url)
    ? item.image_url.filter(Boolean)
    : typeof item.image_url === "string" && item.image_url
      ? [item.image_url]
      : [];
}

export default function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ full_name: string; id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<BookingErrors>({});
  const [booking, setBooking] = useState<BookingFields>({
    startDate: "",
    startTime: "",
    durationHours: "2",
    type: "",
    location: "",
    message: "",
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [slides, setSlides] = useState<GallerySlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/get_photographersId?id=${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok || !result.success || !result.data?.[0]) throw new Error("Photographer profile not found");
        const photographer = result.data[0] as PhotographerProfile;
        if (active) setProfile(photographer);

        const portfolioResponse = await fetch(`/api/portfolios?photographerId=${encodeURIComponent(String(photographer.id))}`);
        if (portfolioResponse.ok) {
          const portfolioResult = await portfolioResponse.json();
          if (active && portfolioResult.success && Array.isArray(portfolioResult.portfolios)) {
            setPortfolioItems(portfolioResult.portfolios);
          }
        }
      } catch (fetchError) {
        console.error("Error loading photographer profile:", fetchError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, [id]);

  const slidesForItem = useCallback((item: PortfolioItem): GallerySlide[] =>
    imagesFor(item).map((src) => ({
      src,
      alt: item.title,
      title: item.title,
      description: item.description,
      location: item.location,
      category: item.category,
    })), []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setSlides([]);
    setCurrentSlide(0);
  }, []);

  const moveSlide = useCallback((offset: number) => {
    setCurrentSlide((current) => (current + offset + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") moveSlide(1);
      if (event.key === "ArrowLeft") moveSlide(-1);
    };
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, closeLightbox, moveSlide]);

  const openCollection = (item: PortfolioItem) => {
    const collectionSlides = slidesForItem(item);
    if (!collectionSlides.length) return;
    setSlides(collectionSlides);
    setCurrentSlide(0);
    setLightboxOpen(true);
  };

  const openAllWorks = () => {
    const allSlides = portfolioItems.flatMap(slidesForItem);
    if (!allSlides.length) return;
    setSlides(allSlides);
    setCurrentSlide(0);
    setLightboxOpen(true);
  };

  const validateBooking = () => {
    const nextErrors: BookingErrors = {};
    if (!booking.startDate) nextErrors.startDate = "Choose a session date.";
    if (!booking.startTime) nextErrors.startTime = "Choose a start time.";
    if (!booking.type) nextErrors.type = "Choose a shoot style.";
    if (!booking.location.trim()) nextErrors.location = "Enter the shoot location.";
    if (!booking.durationHours || Number(booking.durationHours) < 1) nextErrors.durationHours = "Choose a session duration.";
    return nextErrors;
  };

  const updateBookingField = (name: keyof BookingFields, value: string) => {
    setBooking((current) => ({ ...current, [name]: value }));
    setBookingErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    const errors = validateBooking();
    setBookingErrors(errors);
    if (Object.keys(errors).length) return;
    if (!user) {
      toast.error("Log in before sending a booking request.");
      return;
    }

    const durationHours = Number(booking.durationHours);
    const totalPrice = (Number(profile.hourlyRate) || 0) * durationHours;
    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographerId: id,
          startTime: booking.startTime,
          startDate: booking.startDate,
          durationHours,
          location: booking.location.trim(),
          type: booking.type,
          status: "pending",
          totalPrice,
          messages: booking.message.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "Could not send your booking request.");
      toast.success("Booking request sent.");
      setBookingOpen(false);
      setBooking({ startDate: "", startTime: "", durationHours: "2", type: "", location: "", message: "" });
      setBookingErrors({});
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Could not send your booking request.");
    } finally {
      setSubmitting(false);
    }
  };

  const specialties = useMemo(() => profile?.specialties ?? [], [profile?.specialties]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Header />
        <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center gap-3 px-5" role="status">
          <LoaderCircle className="size-6 animate-spin text-forest" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading photographer profile…</p>
        </main>
      </div>
    );
  }
  if (error || !profile) notFound();

  const isAvailable = profile.availability ?? false;
  const hourlyRate = Number(profile.hourlyRate) || 0;
  const estimatedTotal = hourlyRate * Number(booking.durationHours || 1);
  const selectedSlide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="mx-auto max-w-[1320px] px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex min-h-11 items-center gap-2 text-[13px] text-muted-foreground">
          <Link href="/photographers" className="inline-flex min-h-11 items-center gap-2 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
            <ArrowLeft className="size-4 text-forest" aria-hidden="true" />All photographers
          </Link>
          <span aria-hidden="true" className="text-line-strong">/</span>
          <span className="text-ink">Profile</span>
        </nav>

        <section className="grid items-end gap-7 border-b border-line-strong pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10" aria-labelledby="photographer-name">
          <div className="flex min-w-0 items-start gap-5 sm:gap-7">
            <Avatar className="size-[84px] shrink-0 border border-line-strong bg-wash text-muted-foreground sm:size-[106px]">
              <AvatarImage src={profile.profile_image_url || undefined} alt={`${profile.fullname} profile photo`} />
              <AvatarFallback className="rounded-full bg-wash"><UserRound className="size-9" aria-hidden="true" /></AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <p className="mb-1 text-[13px] font-medium text-forest">Photographer profile</p>
              <h1 id="photographer-name" className="break-words font-serif text-[36px] leading-[1.05] tracking-[-0.04em] sm:text-5xl">{profile.fullname}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {profile.location && <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden="true" />{profile.location}</span>}
                {specialties.length > 0 && <span className="inline-flex items-center gap-2"><Camera className="size-4 text-forest" aria-hidden="true" />{specialties.join(" · ")}</span>}
                {Number(profile.experience) > 0 && <span className="inline-flex items-center gap-2"><Clock3 className="size-4" aria-hidden="true" />{profile.experience} {Number(profile.experience) === 1 ? "year" : "years"} experience</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between lg:min-w-[420px] lg:border-0 lg:pt-0">
            <div className="flex items-baseline gap-2 lg:block lg:text-right">
              <span className="text-[13px] font-medium text-muted-foreground">Listed hourly rate</span>
              <div className="text-[27px] font-medium tracking-tight">{hourlyRate ? money(hourlyRate) : "Not listed"}{hourlyRate > 0 && <span className="text-sm font-normal tracking-normal text-muted-foreground"> / hour</span>}</div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Button variant="outline" asChild className="min-h-11 rounded-none border-line-strong px-4 text-sm font-medium">
                <Link href={`/messages?to=${profile.userId}`}><MessageCircle className="size-4" aria-hidden="true" />Message photographer</Link>
              </Button>
              <Button onClick={() => setBookingOpen(true)} disabled={!isAvailable} className="min-h-11 rounded-none px-5 text-sm font-semibold">
                <CalendarDays className="size-4" aria-hidden="true" />{isAvailable ? "Request booking" : "Not accepting bookings"}
              </Button>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-10 pt-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(290px,0.8fr)] lg:gap-16">
          <section aria-labelledby="portfolio-heading" className="min-w-0">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="portfolio-heading" className="font-serif text-[30px] leading-tight tracking-tight sm:text-[34px]">Portfolio</h2>
                <p className="mt-1 text-sm text-muted-foreground">Collections and project images shared by the photographer.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-muted-foreground">{portfolioItems.length} {portfolioItems.length === 1 ? "collection" : "collections"}</span>
                {portfolioItems.some((item) => imagesFor(item).length > 0) && <Button variant="ghost" onClick={openAllWorks} className="min-h-11 px-2 text-[13px] font-semibold text-forest">View all work<ArrowUpRight className="size-4" aria-hidden="true" /></Button>}
              </div>
            </div>
            {portfolioItems.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolioItems.map((item) => {
                  const images = imagesFor(item);
                  const cover = images[0];
                  return (
                    <article key={item.id} className="min-w-0 border-b border-line pb-4">
                      <button type="button" onClick={() => openCollection(item)} disabled={!cover} aria-label={cover ? `Open ${item.title} gallery` : `${item.title}, no images`} className="group relative block aspect-[4/3] w-full overflow-hidden bg-wash text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-default">
                        {cover ? <img src={cover} alt={`${item.title} portfolio work`} loading="lazy" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-muted-foreground"><ImageIcon className="size-8" aria-hidden="true" /></div>}
                        {images.length > 1 && <span className="absolute right-3 top-3 bg-paper/95 px-2 py-1 text-xs font-medium text-ink">{images.length} images</span>}
                      </button>
                      <div className="flex items-start justify-between gap-4 pt-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-semibold">{item.title}</h3>
                          {item.description && <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{item.description}</p>}
                        </div>
                        {item.location && <span className="shrink-0 text-right text-xs text-muted-foreground">{item.location}</span>}
                      </div>
                      {item.category?.length ? <p className="mt-2 text-xs text-muted-foreground">{item.category.join(" · ")}</p> : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[380px] flex-col items-center justify-center border border-dashed border-line-strong bg-wash px-6 py-12 text-center sm:min-h-[490px]">
                <div className="mb-5 flex size-14 items-center justify-center rounded-full border border-line-strong bg-paper text-muted-foreground"><ImageIcon className="size-6" aria-hidden="true" /></div>
                <h3 className="font-serif text-[27px] tracking-tight">No portfolio work added yet</h3>
                <p className="mt-2 max-w-[370px] text-sm leading-6 text-muted-foreground">When this photographer shares project collections, their images and collection titles will appear here.</p>
              </div>
            )}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Only photographs shared in this profile’s portfolio are shown here.</p>
          </section>

          <aside className="space-y-9 lg:pt-1">
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="font-serif text-[27px] tracking-tight">About</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#40453f]">{profile.bio || "No biography has been added yet."}</p>
              <div className="mt-6 border-t border-line-strong pt-5">
                <h3 className="text-[13px] font-semibold">Specialties</h3>
                {specialties.length ? <ul className="mt-2 flex flex-wrap gap-2 p-0">{specialties.map((specialty) => <li key={specialty} className="list-none border border-line px-2.5 py-1 text-[13px] text-muted-foreground">{specialty}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No specialties listed.</p>}
              </div>
            </section>

            <section aria-labelledby="details-heading" className="border-t border-line-strong pt-5">
              <h2 id="details-heading" className="font-serif text-[27px] tracking-tight">Profile details</h2>
              <dl className="mt-3 divide-y divide-line">
                <div className="flex items-start justify-between gap-4 py-3.5"><dt className="text-sm text-muted-foreground">Location</dt><dd className="text-right text-sm font-medium">{profile.location || "Not listed"}</dd></div>
                <div className="flex items-start justify-between gap-4 py-3.5"><dt className="text-sm text-muted-foreground">Experience</dt><dd className="text-right text-sm font-medium">{Number(profile.experience) > 0 ? `${profile.experience} ${Number(profile.experience) === 1 ? "year" : "years"}` : "Not listed"}</dd></div>
                <div className="flex items-start justify-between gap-4 py-3.5"><dt className="text-sm text-muted-foreground">Availability</dt><dd className="text-right text-sm font-medium">{isAvailable ? "Accepting requests" : "Not accepting requests"}</dd></div>
                <div className="flex items-start justify-between gap-4 py-3.5"><dt className="text-sm text-muted-foreground">Hourly rate</dt><dd className="text-right text-sm font-medium">{hourlyRate ? `${money(hourlyRate)} / hour` : "Not listed"}</dd></div>
                <div className="flex items-start justify-between gap-4 py-3.5"><dt className="text-sm text-muted-foreground">Website</dt><dd className="max-w-[65%] text-right text-sm font-medium">{profile.website ? <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-forest underline underline-offset-4">Visit website<Globe className="size-3.5 shrink-0" aria-hidden="true" /></a> : "Not listed"}</dd></div>
              </dl>
            </section>

            <section className="border-t border-line-strong pt-5">
              <h2 className="font-serif text-[27px] tracking-tight">About booking</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the request form to share a shoot date, time, duration, location, and project notes. The listed rate is per hour; the project total depends on the booking details.</p>
            </section>
          </aside>
        </div>
      </main>
      <footer className="border-t border-line bg-wash">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/photographers" className="inline-flex min-h-11 items-center gap-2 font-medium text-forest underline underline-offset-4"><ArrowLeft className="size-4" aria-hidden="true" />Return to all photographers</Link>
          <span>LensConnect · Photographer profile</span>
        </div>
      </footer>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-none border-line bg-paper p-5 text-ink sm:max-w-xl sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="font-serif text-3xl font-normal tracking-tight">Request a booking</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">Share your shoot details with {profile.fullname}. The listed rate is hourly; the estimate updates with your duration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} noValidate className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="booking-date">Session date <span className="text-destructive">*</span></Label>
                <Input id="booking-date" type="date" min={new Date().toISOString().slice(0, 10)} value={booking.startDate} onChange={(event) => updateBookingField("startDate", event.target.value)} aria-invalid={Boolean(bookingErrors.startDate)} aria-describedby={bookingErrors.startDate ? "booking-date-error" : undefined} className="h-11 rounded-none bg-white" />
                {bookingErrors.startDate && <p id="booking-date-error" className="text-sm text-destructive" role="alert">{bookingErrors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-time">Start time <span className="text-destructive">*</span></Label>
                <Input id="booking-time" type="time" value={booking.startTime} onChange={(event) => updateBookingField("startTime", event.target.value)} aria-invalid={Boolean(bookingErrors.startTime)} aria-describedby={bookingErrors.startTime ? "booking-time-error" : undefined} className="h-11 rounded-none bg-white" />
                {bookingErrors.startTime && <p id="booking-time-error" className="text-sm text-destructive" role="alert">{bookingErrors.startTime}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="booking-duration">Duration <span className="text-destructive">*</span></Label>
                <Select value={booking.durationHours} onValueChange={(value) => updateBookingField("durationHours", value)}>
                  <SelectTrigger id="booking-duration" className="h-11 rounded-none bg-white"><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6, 8, 10].map((hours) => <SelectItem key={hours} value={String(hours)}>{hours} {hours === 1 ? "hour" : "hours"}</SelectItem>)}</SelectContent>
                </Select>
                {bookingErrors.durationHours && <p className="text-sm text-destructive" role="alert">{bookingErrors.durationHours}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-type">Shoot style <span className="text-destructive">*</span></Label>
                <Select value={booking.type} onValueChange={(value) => updateBookingField("type", value)}>
                  <SelectTrigger id="booking-type" className="h-11 rounded-none bg-white"><SelectValue placeholder="Select shoot style" /></SelectTrigger>
                  <SelectContent>{(specialties.length ? specialties : ["Portrait", "Event", "Studio", "Commercial"]).map((specialty) => <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>)}</SelectContent>
                </Select>
                {bookingErrors.type && <p className="text-sm text-destructive" role="alert">{bookingErrors.type}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-location">Shoot location <span className="text-destructive">*</span></Label>
              <Input id="booking-location" value={booking.location} onChange={(event) => updateBookingField("location", event.target.value)} placeholder="Studio address or outdoor location" aria-invalid={Boolean(bookingErrors.location)} aria-describedby={bookingErrors.location ? "booking-location-error" : undefined} className="h-11 rounded-none bg-white" />
              {bookingErrors.location && <p id="booking-location-error" className="text-sm text-destructive" role="alert">{bookingErrors.location}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-notes">Project notes</Label>
              <Textarea id="booking-notes" rows={3} maxLength={255} value={booking.message} onChange={(event) => updateBookingField("message", event.target.value)} placeholder="Share your brief, creative direction, or key deliverables." className="min-h-24 resize-y rounded-none bg-white" />
            </div>
            <div className="flex items-center justify-between gap-4 border-y border-line py-3 text-sm">
              <span className="text-muted-foreground">Estimated total at listed rate</span>
              <span className="font-semibold">{money(estimatedTotal)}</span>
            </div>
            <Button type="submit" disabled={submitting} className="min-h-12 w-full rounded-none text-sm font-semibold">
              {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
              {submitting ? "Sending request…" : "Send booking request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {lightboxOpen && selectedSlide && (
          <motion.div key="portfolio-lightbox" role="dialog" aria-modal="true" aria-label={`${selectedSlide.title} gallery`} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101510]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" onClick={closeLightbox} aria-label="Close gallery" className="absolute left-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 border border-white/35 bg-black/45 px-4 text-sm font-medium text-white backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6 sm:top-6"><X className="size-4" aria-hidden="true" />Close</button>
            <span className="absolute top-6 left-1/2 z-20 -translate-x-1/2 text-sm text-white">{currentSlide + 1} / {slides.length}</span>
            {slides.length > 1 && <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-white/35 bg-black/45 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"><ChevronLeft className="size-6" aria-hidden="true" /></button>}
            <motion.img key={selectedSlide.src} src={selectedSlide.src} alt={selectedSlide.alt} className="max-h-[76vh] max-w-[88vw] object-contain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            {slides.length > 1 && <button type="button" onClick={() => moveSlide(1)} aria-label="Next image" className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-white/35 bg-black/45 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"><ChevronRight className="size-6" aria-hidden="true" /></button>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101510] via-[#101510]/90 to-transparent px-5 pb-6 pt-16 text-white sm:px-8">
              <h2 className="font-serif text-2xl">{selectedSlide.title}</h2>
              {selectedSlide.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">{selectedSlide.description}</p>}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/75">{selectedSlide.location && <span>{selectedSlide.location}</span>}{selectedSlide.category?.length ? <span>{selectedSlide.category.join(" · ")}</span> : null}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
