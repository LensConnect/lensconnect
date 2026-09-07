"use client";

import { notFound } from "next/navigation";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import {
  Star,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  Loader2,
  DollarSign,
  Camera,
  Image as ImageIcon,
  Check,
  Globe,
  Briefcase,
  Share2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

interface Profile {
  id: string;
  fullname: string;
  email: string;
  role: string;
  imageUrl?: string;
  phoneNumber?: string;
  portfolio_image_url?: string[];
  profile_image_url?: string;
  location?: string;
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  specialties?: string[];
  availability?: boolean;
  rating?: number;
  website?: string;
}

interface PortfolioItem {
  id: string | number;
  title: string;
  description?: string;
  location?: string;
  category?: string[];
  image_url: string[];
}

interface FormData {
  startDate: string;
  startTime: string;
  durationHours: number;
  type: string;
  location: string;
  message: string;
}

interface FormErrors {
  startDate?: string;
  startTime?: string;
  durationHours?: string;
  type?: string;
  location?: string;
  message?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_id: string;
  profiles?: {
    full_name: string;
    profile_image_url: string;
  };
}

export default function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ full_name: string; id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [photographerReviews, setPhotographerReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    startDate: "",
    startTime: "",
    durationHours: 2,
    type: "",
    location: "",
    message: "",
  });

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.startDate) errors.startDate = "Booking date is required";
    if (!formData.startTime) errors.startTime = "Booking time is required";
    if (!formData.durationHours || formData.durationHours < 1) errors.durationHours = "Duration is required";
    if (!formData.type) errors.type = "Shoot style is required";
    if (!formData.location?.trim()) errors.location = "Location is required";
    return errors;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const response = await fetch(`/api/get_photographersId?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.success && data.data?.[0]) {
          setProfile(data.data[0]);
        } else {
          setError(true);
          return;
        }

        const portfolioResponse = await fetch(`/api/portfolios?photographerId=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const portfolioData = await portfolioResponse.json();

        if (portfolioData.success && portfolioData.portfolios) {
          setPortfolioItems(portfolioData.portfolios);
        }
      } catch (err) {
        console.error("Error fetching creator data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    setFormErrors(validation);

    if (Object.keys(validation).length > 0 || !profile) {
      if (!profile) toast.error("Profile data not loaded");
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      toast.error("You must be logged in to book a session.");
      setIsSubmitting(false);
      return;
    }

    try {
      const durationHours = Number(formData.durationHours) || 1;
      const totalPrice = (Number(profile.hourlyRate) || 0) * durationHours;

      const response = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographerId: id,
          startTime: formData.startTime,
          startDate: formData.startDate,
          durationHours: durationHours,
          location: formData.location,
          type: formData.type,
          status: "pending",
          totalPrice: totalPrice,
          messages: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Booking request failed");
        setIsSubmitting(false);
        return;
      }

      toast.success(data.message || "Commission request sent to creator!");
      setIsBookingOpen(false);
      setFormData({ startDate: "", durationHours: 2, type: "", location: "", message: "", startTime: "" });
    } catch (err) {
      console.error("Error submitting booking:", err);
      toast.error("Failed to send booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) return notFound();

  // Pick cover photo from first portfolio item or tasteful abstract
  const coverImage =
    portfolioItems[0]?.image_url?.[0] ||
    "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2668&auto=format&fit=crop";

  const estimatedTotal = (Number(profile.hourlyRate) || 0) * (Number(formData.durationHours) || 1);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      {/* Hero Cover Header */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-zinc-900">
        <img
          src={coverImage}
          alt={profile.fullname}
          className="w-full h-full object-cover brightness-[0.55] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="absolute top-4 left-4 sm:left-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl text-xs font-semibold h-8.5 bg-background/80 hover:bg-background backdrop-blur-md border-border/40 text-foreground gap-1.5 shadow-xs"
          >
            <Link href="/photographers">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Directory</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Profile Overview Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 space-y-8">
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl p-1 bg-card ring-4 ring-background shadow-md overflow-hidden shrink-0 flex items-center justify-center">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.fullname}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <div className="h-full w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-3xl">
                  {profile.fullname?.charAt(0) || "P"}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {profile.fullname}
                </h1>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border gap-1 ${
                    profile.availability
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      profile.availability ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    }`}
                  />
                  {profile.availability ? "Available for hire" : "Books closed"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {profile.location || "Worldwide"}
                </span>

                {profile.experience && profile.experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {profile.experience} years experience
                  </span>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Rate & Direct Commission CTA */}
          <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-3 pt-2 border-t sm:border-t-0 border-border/60">
            <div className="sm:text-right">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">
                ₦{profile.hourlyRate || 0}
                <span className="text-xs font-semibold text-muted-foreground font-sans uppercase tracking-wider ml-1">
                  / hour
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl text-xs font-semibold h-9 px-3.5 border-border/80 hover:bg-muted"
              >
                <Link href={`/messages?to=${profile.id}`}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <span>Message</span>
                </Link>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsBookingOpen(true)}
                disabled={!profile.availability}
                className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book Shoot</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16">
          {/* Main Portfolio & Bio */}
          <div className="lg:col-span-8 space-y-8">
            {/* About & Specialties */}
            <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">About the Creator</h2>
              </div>

              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.specialties.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border/60"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {profile.bio || "This creator prefers to let their photography work speak for itself."}
              </p>
            </section>

            {/* Selected Works Gallery */}
            <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">Selected Works</h2>
                  <p className="text-xs text-muted-foreground">Recent creative collections & client projects.</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-semibold">
                  {portfolioItems.length} Collections
                </Badge>
              </div>

              {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => {
                    const preview = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url;
                    return (
                      <div
                        key={item.id}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 bg-muted shadow-xs hover:border-primary/40 transition-all"
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                          <h4 className="text-sm font-bold truncate">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-white/75 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Portfolio is currently being curated.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sticky Sidebar Info & Deliverables */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Booking Overview
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct commissions with verified delivery guarantee.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Base Rate</span>
                  <span className="font-mono font-bold text-foreground">₦{profile.hourlyRate || 0}/hr</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {profile.availability ? "Accepting commissions" : "Books closed"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!profile.availability}
                  className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Request Booking
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="w-full h-11 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted"
                >
                  <Link href={`/messages?to=${profile.id}`}>
                    <MessageSquare className="h-4 w-4 mr-1.5 text-primary" />
                    Inquire via Message
                  </Link>
                </Button>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Included with Booking
                </span>
                <ul className="space-y-2 text-xs text-foreground/80">
                  {[
                    "Pre-shoot style consultation",
                    "High-resolution edited deliverables",
                    "Commercial license & usage rights",
                    "Private gallery download link",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-lg bg-card text-foreground border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">Request Photography Session</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send your shoot requirements directly to <strong className="text-foreground">{profile.fullname}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-semibold text-foreground">
                  Session Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="h-10 rounded-xl bg-background border-border/80 text-xs"
                />
                {formErrors.startDate && <p className="text-[11px] text-destructive">{formErrors.startDate}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs font-semibold text-foreground">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="h-10 rounded-xl bg-background border-border/80 text-xs"
                />
                {formErrors.startTime && <p className="text-[11px] text-destructive">{formErrors.startTime}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="durationHours" className="text-xs font-semibold text-foreground">
                  Duration (Hours) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.durationHours.toString()}
                  onValueChange={(val) => handleSelectChange("durationHours", val)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 text-xs">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((h) => (
                      <SelectItem key={h} value={h.toString()} className="text-xs">
                        {h} {h === 1 ? "Hour" : "Hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold text-foreground">
                  Shoot Style <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(val) => handleSelectChange("type", val)}>
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 text-xs">
                    <SelectValue placeholder="Select shoot type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {(profile.specialties?.length ? profile.specialties : ["Portrait", "Event", "Studio", "Commercial"]).map(
                      (s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-[11px] text-destructive">{formErrors.type}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                Shoot Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  placeholder="Studio address or outdoor location..."
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs"
                />
              </div>
              {formErrors.location && <p className="text-[11px] text-destructive">{formErrors.location}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs font-semibold text-foreground">
                Project Notes & Creative Direction
              </Label>
              <Textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Describe your vision, theme, preferred gear, or key deliverables..."
                value={formData.message}
                onChange={handleInputChange}
                className="rounded-xl bg-background border-border/80 text-xs resize-none"
              />
            </div>

            {/* Estimated Total Bar */}
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Estimated Investment:</span>
              <span className="font-mono font-bold text-sm text-primary">₦{estimatedTotal.toLocaleString()}</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                "Send Commission Request"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
