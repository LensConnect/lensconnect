"use client";

import { notFound } from "next/navigation";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import NextImage from "next/image";
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
  Banknote ,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  Play,
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
  totalPrice: number;
}

interface FormErrors {
  startDate?: string;
  startTime?: string;
  durationHours?: string;
  type?: string;
  location?: string;
  message?: string;
  specialties?: string[];
  totalPrice?: number; 
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

interface LightboxSlide {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  location?: string;
  category?: string[];
}

export default function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ full_name: string; id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
const availabilities = [
 "Wedding",
  "Portrait",
  "Event",
  "Nature",
  "Fashion",
  "Sports",
  "Travel",
  "Product",
  ]
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [photographerReviews, setPhotographerReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox / Slideshow State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<LightboxSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const normalizeImages = (image_url: string | string[]): string[] => {
    if (Array.isArray(image_url)) return image_url.filter(Boolean);
    if (typeof image_url === "string" && image_url) return [image_url];
    return [];
  };


 

  
  const buildSlides = (item: PortfolioItem): LightboxSlide[] => {
    const images = normalizeImages(item.image_url);
    return images.map((src) => ({
      src,
      alt: item.title,
      title: item.title,
      description: item.description,
      location: item.location,
      category: item.category,
    }));
  };

  const openLightbox = (slides: LightboxSlide[], startAt = 0) => {
    setLightboxSlides(slides);
    setCurrentSlide(startAt);
    setLightboxOpen(true);
  };

  const openItemLightbox = (item: PortfolioItem) => {
    openLightbox(buildSlides(item), 0);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxSlides([]);
    setCurrentSlide(0);
  };

  const nextImage = () => {
    if (lightboxSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % lightboxSlides.length);
  };

  const prevImage = () => {
    if (lightboxSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + lightboxSlides.length) % lightboxSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || lightboxSlides.length <= 1) {
      setTouchStart(null);
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) prevImage();
      else nextImage();
    }
    setTouchStart(null);
  };

  // Form State
  const [formData, setFormData] = useState<FormData>({
    startDate: "",
    startTime: "",
    durationHours: 2,
    type: "",
    location: "",
    message: "",
    totalPrice: 0
  });

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.startDate) errors.startDate = "Booking date is required";
    if (!formData.startTime) errors.startTime = "Booking time is required";
    if (!formData.durationHours || formData.durationHours < 1) errors.durationHours = "Duration is required";
    if (!formData.type) errors.type = "Shoot style is required";
    if(!formData.totalPrice || formData.totalPrice > 0)  errors.totalPrice = 0;
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

  // Keyboard navigation & body scroll lock for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, lightboxSlides, currentSlide]);

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
      setFormData({ startDate: "", durationHours: 2, type: "", location: "", message: "", startTime: "" , totalPrice});
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
                <NextImage
                  src={profile.profile_image_url}
                  alt={profile.fullname}
                  width={300}
                  height={300}
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
                  <div className="flex items-center gap-2.5">
                    {portfolioItems.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() =>
                          openLightbox(
                            portfolioItems.flatMap((item) => buildSlides(item)),
                            0
                          )
                        }
                        className="rounded-xl text-xs font-bold h-8.5 px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        <span>Slideshow All</span>
                      </Button>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs font-mono font-semibold border-primary/30 text-primary bg-primary/5"
                    >
                      {portfolioItems.length} Collections
                    </Badge>
                  </div>
              </div>

              {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => {
                    const images = normalizeImages(item.image_url);
                    const preview = images[0];
                    const hasMultiple = images.length > 1;
                    return (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
                      >
                        <div className="aspect-[4/3] relative">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-95" />
                          <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-80 transition-opacity group-hover:opacity-100" />
                          {hasMultiple && (
                            <div className="absolute right-3 top-3 rounded-full border border-primary/40 bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                              <ImageIcon className="mr-1 inline-block h-3 w-3 text-primary" />
                              {images.length} photos
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                            <h4 className="text-sm font-bold truncate">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-white/75 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 p-3.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            {item.location ? (
                              <div className="flex min-w-0 max-w-full items-center gap-1.5 text-xs text-muted-foreground sm:max-w-[48%]">
                                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                <span className="min-w-0 truncate" title={item.location}>
                                  {item.location}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">Location not set</span>
                            )}
                            {item.category && item.category.length > 0 && (
                              <div className="flex min-w-0 max-w-full flex-wrap gap-1 sm:max-w-[52%] sm:justify-end">
                                {item.category.map((c) => (
                                  <Badge
                                    key={c}
                                    variant="secondary"
                                    className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0 text-[9px] font-semibold text-primary"
                                  >
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => openItemLightbox(item)}
                            className="h-10 w-full gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>View Gallery</span>
                          </Button>
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

            {/* Fullscreen Lightbox / Slide Viewer */}
            <AnimatePresence>
              {lightboxOpen && lightboxSlides.length > 0 && (
                <motion.div
                  key="lightbox-backdrop"
                  className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#100907]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Cinematic orange-lit vignette */}
                  <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#100907_100%)]" />
                  </div>

                  <div className="absolute inset-x-0 top-0 z-10 h-1 bg-white/10">
                    <motion.div
                      className="h-full bg-primary shadow-[0_0_18px_rgba(255,79,1,0.9)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentSlide + 1) / lightboxSlides.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>

                  
                  <button
                    type="button"
                    onClick={closeLightbox}
                    aria-label="Close gallery"
                    className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#100907] sm:left-6 sm:px-4"
                  >
                    <X className="h-5 w-5" />
                    <span>Close</span>
                  </button>

                  
                 
                  {/* Counter */}
                  <motion.div
                    key="lb-counter"
                    className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-primary/40 bg-black/50 px-3 py-1 font-mono text-xs font-semibold text-white backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {currentSlide + 1} / {lightboxSlides.length}
                  </motion.div>

                  {/* Prev */}
                  {lightboxSlides.length > 1 && (
                    <motion.button
                      key="lb-prev"
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 p-2 text-primary-foreground shadow-xl shadow-black/40 backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-primary"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ x: -2 }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                  )}

                  {/* Main Image */}
                  <motion.div
                    key={`lb-image-${currentSlide}`}
                    className="flex max-h-[72vh] max-w-[88vw] items-center justify-center sm:max-h-[76vh]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <img
                      src={lightboxSlides[currentSlide]?.src}
                      alt={lightboxSlides[currentSlide]?.alt}
                      className="max-w-full max-h-[75vh] object-contain drop-shadow-2xl"
                    />
                  </motion.div>

                  {/* Next */}
                  {lightboxSlides.length > 1 && (
                    <motion.button
                      key="lb-next"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 p-2 text-primary-foreground shadow-xl shadow-black/40 backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-primary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ x: 2 }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>
                  )}

                  {/* Info Bar */}
                  <motion.div
                    key="lb-info"
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#100907] via-[#100907]/90 to-transparent px-5 pb-6 pt-20 text-white sm:px-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <div className="mb-2 h-1 w-10 rounded-full bg-primary shadow-[0_0_12px_rgba(255,79,1,0.8)]" />
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {lightboxSlides[currentSlide]?.title}
                    </h3>
                    {lightboxSlides[currentSlide]?.description && (
                      <p className="text-sm text-white/65 mt-1.5 line-clamp-2">
                        {lightboxSlides[currentSlide].description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-white/50">
                      {lightboxSlides[currentSlide]?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="text-white/70">
                            {lightboxSlides[currentSlide].location}
                          </span>
                        </span>
                      )}
                      {lightboxSlides[currentSlide]?.category &&
                        lightboxSlides[currentSlide].category!.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span className="text-white/70">
                              {lightboxSlides[currentSlide].category!.join(", ")}
                            </span>
                          </span>
                        )}
                    </div>
                  </motion.div>

                  {/* Thumbnail Strip */}
                  {lightboxSlides.length > 1 && (
                    <motion.div
                      key="lb-thumbnails"
                      className="absolute bottom-32 left-1/2 flex max-w-[calc(100vw-5rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-primary/25 bg-black/55 px-3 py-2 backdrop-blur-md sm:bottom-36"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      {lightboxSlides.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentSlide
                              ? "scale-110 border-primary opacity-100 shadow-[0_0_14px_rgba(255,79,1,0.65)]"
                              : "border-white/30 opacity-50 hover:opacity-80 hover:border-white/50"
                          }`}
                        >
                          <img
                            src={slide.src}
                            alt={slide.alt}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
        <DialogContent className="sm:max-w-lg bg-card text-foreground border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
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
                <MapPin className=" -mt-2  absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
              <Label htmlFor="totalPrice" className="text-xs font-semibold text-foreground">
                 Budget <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Banknote className=" -mt-2 absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="totalPrice"
                  name="totalPrice"
                  placeholder="Enter your budget"
                  required
                  type="number"
                  value={formData.totalPrice}
                  onChange={handleInputChange}
                  className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs"
                />
              </div>
              {formErrors.location && <p className="text-[11px] text-destructive">{formErrors.location}</p>}
            </div>

            
              
            {/* <div className="space-y-1.5">
                <Label htmlFor="totalPrice" className="text-xs font-semibold text-foreground">
                Estimated price
              </Label>
              <input
                id="totalPrice"
                name="totalPrice"
                placeholder="Enter your budgeted price or estimate"
                value={formData.totalPrice}
                onChange={handleInputChange}
                className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs w-full"
              />
            </div> */}

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
