"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Tag,
  ImagePlus,
  ArrowLeft,
  Sparkles,
  Plus,
  Layers,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FormData {
  imageUrl: string[];
  title: string;
  location: string;
  description: string;
  category: string[];
}

interface FormErrors {
  imageUrl?: string[];
  title?: string;
  location?: string;
  description?: string;
}

interface Portfolio {
  id: string;
  photographerId: string;
  title: string;
  description: string;
  location: string;
  category: string[];
  imageUrl: string[];
  created_at: string;
}

const categories = [
  "Weddings",
  "Portraits",
  "Events",
  "Landscapes",
  "Wildlife",
  "Fashion",
  "Sports",
  "Travel",
  "Macro",
  "Street",
  "Commercial",
  "Editorial",
];

export default function PortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    imageUrl: [],
    title: "",
    location: "",
    description: "",
    category: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activeIndex, setActiveIndex] = useState<{ [key: string]: number }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (item: Portfolio) => {
    setSelectedPortfolio(item);
    setLightboxIndex(activeIndex[item.id] || 0);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedPortfolio(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen || !selectedPortfolio) return;
      const total = selectedPortfolio.imageUrl.length;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, selectedPortfolio]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) =>
      prev.category.includes(cat)
        ? { ...prev, category: prev.category.filter((c) => c !== cat) }
        : { ...prev, category: [...prev.category, cat] }
    );
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: prev.imageUrl.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.imageUrl.length === 0)
      newErrors.imageUrl = ["Please upload at least one image."];
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      toast.error("You must be logged in to create a portfolio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/create_portfolios?photographerId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographerId: user.id,
          title: formData.title,
          location: formData.location,
          description: formData.description,
          category: formData.category,
          imageUrl: formData.imageUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to create portfolio entry");
      } else {
        toast.success(data.message || "Portfolio created successfully!");
        setFormData({ imageUrl: [], title: "", location: "", description: "", category: [] });
        fetchPortfolio(user.id);
      }
    } catch {
      toast.error("Unexpected error occurred while creating portfolio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (id: string, total: number) => {
    setActiveIndex((prev) => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % total }));
  };

  const handlePrev = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) - 1 < 0 ? total - 1 : (prev[id] ?? 0) - 1,
    }));
  };

  const fetchPortfolio = async (userId: string) => {
    try {
      const response = await fetch(`/api/create_portfolios?photographerId=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok && data.portfolios) {
        setPortfolios(data.portfolios);
      }
    } catch (error) {
      console.error("Error fetching portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      {/* Header Banner */}
      <section className="border-b border-border/80 bg-card py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl text-xs font-semibold h-8.5 px-3 border-border/80 bg-background hover:bg-muted gap-1.5 shadow-xs"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground"
                >
                  <ImagePlus className="h-3.5 w-3.5 text-primary" />
                  Creator Showcase
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Portfolio Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Manage Portfolio Works
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Upload your curated photography collections and editorial shoots.
              </p>
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              <strong className="text-foreground">{portfolios.length}</strong> collections published
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Upload Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="border-b border-border/60 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Add New Collection
            </h2>
            <span className="text-xs text-muted-foreground">
              Images appear on your public creator profile
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Zone */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-foreground">
                Collection Photos <span className="text-destructive">*</span>
              </Label>

              <div
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                  errors.imageUrl
                    ? "border-destructive bg-destructive/5"
                    : "border-border/80 hover:border-primary/50 bg-muted/20"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Upload High-Res Shots</p>
                    <p className="text-[11px] text-muted-foreground">
                      Up to 10 images · Max 8MB each · JPG, PNG, WEBP
                    </p>
                  </div>

                  <div className="pt-2">
                    <UploadButton<OurFileRouter, "portfolioImages">
                      endpoint="portfolioImages"
                      appearance={{
                        button:
                          "bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs shadow-xs hover:bg-primary/90 transition-all",
                        allowedContent: "hidden",
                        container: "flex flex-col items-center gap-1",
                      }}
                      content={{
                        button({ ready, isUploading, uploadProgress }) {
                          if (isUploading)
                            return (
                              <span className="flex items-center gap-1.5 text-xs">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                {uploadProgress ? `${uploadProgress}%` : "Uploading..."}
                              </span>
                            );
                          return ready ? "Select Files" : "Loading...";
                        },
                      }}
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          const urls = res.map((r) => r.ufsUrl);
                          setFormData((prev) => ({
                            ...prev,
                            imageUrl: [...prev.imageUrl, ...urls],
                          }));
                          setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                          toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded!`);
                        }
                      }}
                      onUploadError={(err) => {
                        toast.error(`Upload failed: ${err.message}`);
                      }}
                    />
                  </div>
                </div>
              </div>

              {errors.imageUrl && (
                <p className="text-destructive text-[11px] font-medium">{errors.imageUrl[0]}</p>
              )}

              {/* Uploaded Images Preview Strip */}
              <AnimatePresence>
                {formData.imageUrl.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2"
                  >
                    {formData.imageUrl.map((img, idx) => (
                      <div
                        key={img}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-border/80 bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Upload preview ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-lg bg-destructive text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all shadow-xs"
                          title="Remove photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Title & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-foreground">
                  Collection Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Sunset Editorial at Lekki Beach"
                  value={formData.title}
                  onChange={handleChange}
                  className="h-10 rounded-xl bg-background border-border/80 text-xs"
                />
                {errors.title && <p className="text-destructive text-[11px]">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                  Location <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Lagos, Nigeria"
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs"
                  />
                </div>
                {errors.location && <p className="text-destructive text-[11px]">{errors.location}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-foreground">
                Story / Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Share the creative direction, concept, and equipment used in this shoot..."
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl bg-background border-border/80 text-xs resize-none"
              />
              {errors.description && <p className="text-destructive text-[11px]">{errors.description}</p>}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Categories / Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const active = formData.category.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                          : "bg-background text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Publishing Collection...</span>
                </>
              ) : (
                "Publish Collection"
              )}
            </Button>
          </form>
        </motion.div>

        {/* Portfolio Gallery Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Published Portfolio Collections</span>
            </h2>
            <span className="text-xs text-muted-foreground">Click collection to inspect full gallery</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border/60 bg-card p-4 space-y-3">
                  <Skeleton className="h-44 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-foreground">No Collections Uploaded</h3>
                <p className="text-xs text-muted-foreground">
                  Use the form above to add your first photo series or editorial project.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {portfolios.map((item) => {
                const currentIndex = activeIndex[item.id] || 0;
                const total = item.imageUrl.length;

                return (
                  <div
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <Image
                          src={item.imageUrl[currentIndex] || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />

                        {total > 1 && (
                          <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                            {currentIndex + 1} / {total}
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <h3 className="text-sm font-bold truncate">{item.title}</h3>
                          {item.location && (
                            <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </p>
                          )}
                        </div>

                        {/* Prev/Next overlay controls */}
                        {total > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrev(item.id, total);
                              }}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNext(item.id, total);
                              }}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="p-3.5 space-y-2">
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.category && item.category.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.category.slice(0, 2).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-3.5 pb-3 pt-1 border-t border-border/40 text-[11px] font-semibold text-primary flex items-center justify-between">
                      <span>View Gallery</span>
                      <Eye className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {isOpen && selectedPortfolio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-8 flex items-center justify-center"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6"
              >
                <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {selectedPortfolio.title}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {selectedPortfolio.location}
                    </p>
                  </div>

                  <button
                    onClick={closeLightbox}
                    className="h-8 w-8 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Lightbox Image */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center">
                  <Image
                    src={selectedPortfolio.imageUrl[lightboxIndex] || "/placeholder.svg"}
                    alt={selectedPortfolio.title}
                    fill
                    className="object-contain"
                  />

                  {selectedPortfolio.imageUrl.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setLightboxIndex(
                            (i) =>
                              (i - 1 + selectedPortfolio.imageUrl.length) %
                              selectedPortfolio.imageUrl.length
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-md transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setLightboxIndex(
                            (i) => (i + 1) % selectedPortfolio.imageUrl.length
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-md transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-white font-mono font-bold">
                    {lightboxIndex + 1} / {selectedPortfolio.imageUrl.length}
                  </div>
                </div>

                {/* Thumbnail Rail */}
                {selectedPortfolio.imageUrl.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedPortfolio.imageUrl.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          i === lightboxIndex
                            ? "border-primary shadow-xs scale-95"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={url} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedPortfolio.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {selectedPortfolio.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
