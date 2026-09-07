"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { saveProfileImage } from "@/app/actions/profile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  ExternalLink,
  Save,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  User as UserIcon,
  CheckCircle2,
  DollarSign,
  Clock,
  Sparkles,
  Eye,
  Plus,
  ShieldCheck,
  Check,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type UserRole = "photographer" | "client";

interface ProfileData {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
  userId?: number;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  hourly_rate?: number;
  experience?: number;
  specialties?: string[];
  portfolio_url?: string;
  profile_image_url?: string;
  website?: string;
  availability?: boolean;
}

interface PortfolioItem {
  id: number | string;
  title: string;
  description?: string;
  location?: string;
  category?: string[];
  image_url?: string[];
}

const AVAILABLE_SPECIALTIES = [
  "Wedding",
  "Portrait",
  "Event",
  "Fashion",
  "Commercial",
  "Editorial",
  "Studio",
  "Architecture",
  "Product",
  "Travel",
  "Nature",
  "Sports",
  "Headshots",
  "Real Estate",
  "Documentary",
];

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch Profile Data
  const {
    isLoading: profileLoading,
    error: profileError,
    data: profileData,
    refetch: refetchProfile,
  } = useQuery<ProfileData | null>({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id && !authLoading,
    queryFn: async () => {
      if (!user?.id) return null;

      const response = await fetch(`/api/profiles?userId=${user.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to fetch profile data");
      }

      const data = await response.json();
      return data.result ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Sync profile data to local form state
  useEffect(() => {
    if (profileData) {
      setProfile({
        ...profileData,
        hourlyRate: profileData.hourlyRate ?? profileData.hourly_rate ?? 0,
        experience: profileData.experience ?? 0,
        specialties: Array.isArray(profileData.specialties) ? profileData.specialties : [],
        phoneNumber: profileData.phoneNumber || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        website: profileData.website || "",
        portfolio_url: profileData.portfolio_url || "",
        profile_image_url: profileData.profile_image_url || "",
        availability: profileData.availability ?? true,
      });
      setIsDirty(false);
    }
  }, [profileData]);

  // Fetch Photographer Portfolios if applicable
  const { data: portfoliosData } = useQuery<{ portfolios: PortfolioItem[]; success: boolean }>({
    queryKey: ["portfolios", profile?.id],
    enabled: !!profile?.id && profile?.role === "photographer",
    queryFn: async () => {
      if (!profile?.id) return { portfolios: [], success: true };
      const res = await fetch(`/api/portfolios?photographerId=${profile.id}`);
      if (!res.ok) return { portfolios: [], success: false };
      return res.json();
    },
    staleTime: 1000 * 60 * 3,
  });

  const portfolioItems: PortfolioItem[] = portfoliosData?.portfolios || [];

  // Form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;

    if (name === "hourlyRate" || name === "experience") {
      processedValue = value === "" ? "" : Math.max(0, Number(value));
    }

    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: processedValue };
    });
    setIsDirty(true);
  };

  const handleToggleAvailability = (checked: boolean) => {
    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, availability: checked };
    });
    setIsDirty(true);
  };

  const toggleSpecialty = (specialty: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const current = prev.specialties || [];
      const updated = current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty];

      return { ...prev, specialties: updated };
    });
    setIsDirty(true);
  };

  // Avatar Image Upload via Supabase & Database Sync
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_image")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("profile_image")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setProfile((prev) => {
        if (!prev) return null;
        return { ...prev, profile_image_url: publicUrl };
      });
      setIsDirty(true);

      // Persist to database immediately
     /*  const result = await saveProfileImage(user.id, publicUrl);
      if (!result.success) {
        // Fallback update
        await supabase
          .from("profiles")
          .update({ imageUrl: publicUrl, profile_image_url: publicUrl })
          .eq("userId", user.id);
      } */

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save full profile changes
  const handleSave = async () => {
    if (!profile || !user?.id) return;

    if (!profile.fullname?.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, any> = {
        userId: user.id,
        fullname: profile.fullname.trim(),
        bio: profile.bio || "",
        location: profile.location || "",
        phoneNumber: profile.phoneNumber || "",
      };

      if (profile.role === "photographer") {
        payload.hourlyRate = profile.hourlyRate ? Number(profile.hourlyRate) : 0;
        payload.experience = profile.experience ? Number(profile.experience) : 0;
        payload.specialties = profile.specialties || [];
        payload.profile_image_url = profile.profile_image_url || "";
        payload.availability = profile.availability ?? true;
      }

      if (profile.role === "client") {
        payload.imageUrl = profile.profile_image_url || "";
        payload.website = profile.website || "";
        payload.profile_image_url = profile.profile_image_url || "";
      }

      const response = await fetch(`/api/profiles?userId=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsDirty(false);
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        toast.success("Profile saved successfully!");
      } else {
        toast.error(data.error || "Failed to save profile changes");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Profile Completeness Calculation
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    let total = 5;

    if (profile.fullname) score++;
    if (profile.profile_image_url) score++;
    if (profile.bio) score++;
    if (profile.location) score++;
    if (profile.phoneNumber) score++;

    if (profile.role === "photographer") {
      total += 3;
      if (profile.hourlyRate && profile.hourlyRate > 0) score++;
      if (profile.specialties && profile.specialties.length > 0) score++;
      if (portfolioItems.length > 0) score++;
    }

    return Math.round((score / total) * 100);
  };

  const completeness = calculateCompleteness();
  const isPhotographer = profile?.role === "photographer";

  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Failed to Load Profile</h2>
          <p className="text-sm text-muted-foreground">
            {profileError instanceof Error
              ? profileError.message
              : "We could not find your profile information. Please verify your connection and try again."}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" asChild>
              <Link href="/">Return Home</Link>
            </Button>
            <Button onClick={() => refetchProfile()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      {/* Top Action & Navigation Bar */}
      <div className="sticky top-16 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href={isPhotographer ? "/dashboard" : "/dashboard/client"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-muted-foreground/40 font-mono text-sm">/</span>
            <span className="text-xs font-semibold text-foreground">Profile Settings</span>
          </div>

          <div className="flex items-center gap-2.5">
            {isPhotographer && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:inline-flex text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted gap-1.5"
              >
                <Link
                  href={`/photographer/${encodeURIComponent(profile.fullname || "creator")}/${profile.id}`}
                  target="_blank"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Public View</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all gap-1.5 ${
                isDirty
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted cursor-default opacity-80"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{isDirty ? "Save Changes" : "Saved"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Hero Header */}
        <section className="relative rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {/* Subtle Ambient Banner */}
          <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FF4F01_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar with Camera Trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl p-1 bg-card ring-4 ring-background shadow-md overflow-hidden flex items-center justify-center">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={profile.fullname}
                      className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                      <UserIcon className="h-12 w-12 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-1 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-white backdrop-blur-[2px] cursor-pointer"
                    title="Change profile photo"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span className="text-[10px] font-semibold tracking-wide">Change</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Floating upload button for touch devices */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="sm:hidden absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md ring-2 ring-background"
                  aria-label="Upload photo"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {profile.fullname || "Unnamed Profile"}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border border-border/60"
                  >
                    {profile.role}
                  </Badge>

                  {isPhotographer && (
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
                      {profile.availability ? "Available for hire" : "Unavailable"}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {profile.email}
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {profile.location}
                    </span>
                  )}
                  {isPhotographer && Number(profile.hourlyRate) > 0 && (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                      ${profile.hourlyRate}/hr
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completeness Pill */}
            <div className="w-full sm:w-60 bg-muted/60 rounded-2xl p-3 border border-border/50">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-muted-foreground">Profile Strength</span>
                <span className="text-primary font-bold">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-1.5 bg-background" />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {completeness === 100
                  ? "Great job! Profile is fully optimized."
                  : "Complete your profile to build trust with clients."}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content: Tabs + Dual-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Tabs */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="bg-card border border-border/80 p-1 rounded-2xl h-auto flex flex-wrap gap-1 w-full justify-start">
                <TabsTrigger
                  value="general"
                  className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-1.5"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>General Info</span>
                </TabsTrigger>

                {isPhotographer && (
                  <>
                    <TabsTrigger
                      value="professional"
                      className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-1.5"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>Rates & Specialties</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="portfolio"
                      className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-1.5"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Works & Portfolio</span>
                      {portfolioItems.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {portfolioItems.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </>
                )}

                <TabsTrigger
                  value="account"
                  className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Account</span>
                </TabsTrigger>
              </TabsList>

              {/* ── TAB 1: General Info ── */}
              <TabsContent value="general" className="space-y-6 focus-visible:outline-none">
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="border-b border-border/60 pb-4">
                    <h3 className="text-base font-bold text-foreground">Basic Information</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Personalize your identity and contact information for clients.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        value={profile.fullname || ""}
                        onChange={handleChange}
                        placeholder="e.g. Maya Chen"
                        className="rounded-xl bg-background border-border/80 text-sm h-11 focus-visible:ring-primary/20"
                      />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                          Email Address
                        </Label>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verified
                        </span>
                      </div>
                      <Input
                        id="email"
                        name="email"
                        disabled
                        value={profile.email || ""}
                        className="rounded-xl bg-muted/60 border-border/60 text-sm h-11 text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-xs font-semibold text-foreground">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profile.phoneNumber || ""}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="rounded-xl bg-background border-border/80 pl-10 text-sm h-11 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                        Location / City
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                          id="location"
                          name="location"
                          value={profile.location || ""}
                          onChange={handleChange}
                          placeholder="e.g. San Francisco, CA"
                          className="rounded-xl bg-background border-border/80 pl-10 text-sm h-11 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio" className="text-xs font-semibold text-foreground">
                        {isPhotographer ? "Artist Statement & Bio" : "About You / Company"}
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(profile.bio || "").length} / 400
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      name="bio"
                      maxLength={400}
                      rows={4}
                      value={profile.bio || ""}
                      onChange={handleChange}
                      placeholder={
                        isPhotographer
                          ? "Share your photography style, creative philosophy, gear, and what makes your work distinct..."
                          : "Tell creators about your organization, project style, and collaboration goals..."
                      }
                      className="rounded-xl bg-background border-border/80 text-sm resize-none focus-visible:ring-primary/20 leading-relaxed"
                    />
                  </div>

                  {/* Website / External Link */}
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="website" className="text-xs font-semibold text-foreground">
                      Website / Online Portfolio
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="website"
                        name={isPhotographer ? "portfolio_url" : "website"}
                        value={
                          isPhotographer
                            ? profile.portfolio_url || ""
                            : profile.website || ""
                        }
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="rounded-xl bg-background border-border/80 pl-10 text-sm h-11 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 2: Rates & Specialties (Photographers only) ── */}
              {isPhotographer && (
                <TabsContent value="professional" className="space-y-6 focus-visible:outline-none">
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="border-b border-border/60 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Pricing & Experience</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Set your baseline booking rate and key photography domains.
                        </p>
                      </div>
                    </div>

                    {/* Rates & Experience Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-xs font-semibold text-foreground">
                          Hourly Rate ($ USD)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            id="hourlyRate"
                            name="hourlyRate"
                            type="number"
                            min="0"
                            step="5"
                            value={profile.hourlyRate ?? ""}
                            onChange={handleChange}
                            placeholder="150"
                            className="rounded-xl bg-background border-border/80 pl-10 text-sm h-11 focus-visible:ring-primary/20 font-mono"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Base rate displayed on discovery search and job proposals.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience" className="text-xs font-semibold text-foreground">
                          Years of Experience
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            min="0"
                            max="50"
                            value={profile.experience ?? ""}
                            onChange={handleChange}
                            placeholder="5"
                            className="rounded-xl bg-background border-border/80 pl-10 text-sm h-11 focus-visible:ring-primary/20 font-mono"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Professional shooting experience in the industry.
                        </p>
                      </div>
                    </div>

                    {/* Availability Switch */}
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">Available for New Bookings</span>
                          {profile.availability && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          When turned off, clients will see that you are currently booked out.
                        </p>
                      </div>
                      <Switch
                        id="availability"
                        checked={profile.availability ?? true}
                        onCheckedChange={handleToggleAvailability}
                      />
                    </div>

                    {/* Specialties Picker */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground">
                          Creative Specialties
                        </Label>
                        <span className="text-xs text-muted-foreground font-medium">
                          {(profile.specialties || []).length} selected
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select all styles you specialize in. These help clients find you through search filters.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {AVAILABLE_SPECIALTIES.map((specialty) => {
                          const isSelected = profile.specialties?.includes(specialty);
                          return (
                            <button
                              key={specialty}
                              type="button"
                              onClick={() => toggleSpecialty(specialty)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer select-none ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]"
                                  : "bg-background text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              ) : (
                                <Plus className="h-3 w-3 opacity-60" />
                              )}
                              <span>{specialty}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* ── TAB 3: Portfolio & Works (Photographers only) ── */}
              {isPhotographer && (
                <TabsContent value="portfolio" className="space-y-6 focus-visible:outline-none">
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="border-b border-border/60 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Portfolio Showcase</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Visual proof of your best shoots and client projects.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="rounded-xl text-xs font-semibold h-8 gap-1 border-border/80"
                      >
                        <Link href="/dashboard/portfolio">
                          <span>Manage Works</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>

                    {portfolioItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioItems.map((item) => {
                          const previewImage =
                            Array.isArray(item.image_url) && item.image_url.length > 0
                              ? item.image_url[0]
                              : typeof item.image_url === "string"
                              ? item.image_url
                              : null;

                          return (
                            <div
                              key={item.id}
                              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 bg-muted shadow-xs hover:border-primary/40 transition-all"
                            >
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <ImageIcon className="h-8 w-8 opacity-40" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity" />
                              <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                                <p className="text-sm font-bold truncate">{item.title}</p>
                                {item.location && (
                                  <p className="text-[11px] text-white/75 flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add Work Card */}
                        <Link
                          href="/dashboard/portfolio"
                          className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group p-4 text-center"
                        >
                          <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-xs font-semibold">Add New Work</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-border/80 text-center flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div className="max-w-sm space-y-1">
                          <h4 className="text-sm font-bold text-foreground">No Works Uploaded Yet</h4>
                          <p className="text-xs text-muted-foreground">
                            Upload your client shoots or creative series to showcase your work directly to potential clients.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          asChild
                          className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 gap-1.5"
                        >
                          <Link href="/dashboard/portfolio">
                            <Plus className="h-3.5 w-3.5" />
                            <span>Upload Portfolio</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* ── TAB 4: Account & Security ── */}
              <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="border-b border-border/60 pb-4">
                    <h3 className="text-base font-bold text-foreground">Account & Credentials</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      System identification and account membership configuration.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Account Role
                        </span>
                        <p className="text-sm font-bold text-foreground capitalize flex items-center gap-1.5">
                          <Badge variant="outline" className="text-xs capitalize font-semibold">
                            {profile.role}
                          </Badge>
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          User ID Reference
                        </span>
                        <p className="text-sm font-mono font-medium text-foreground">
                          #{profile.id}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground">Public Creator Profile</h4>
                        <p className="text-xs text-muted-foreground">
                          {isPhotographer
                            ? "Your profile is indexable in LensConnect talent search."
                            : "Your profile is visible to photographers when posting jobs."}
                        </p>
                      </div>
                      {isPhotographer && (
                        <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-semibold">
                          <Link
                            href={`/photographer/${encodeURIComponent(profile.fullname || "creator")}/${profile.id}`}
                            target="_blank"
                          >
                            View
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Sidebar: Live Public Card Preview */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground tracking-wide uppercase">
                    Live Preview
                  </span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Client Perspective
                </span>
              </div>

              {/* Mini Profile Card */}
              <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/60">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <UserIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {profile.fullname || "Your Name"}
                      </h4>
                      {isPhotographer && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {isPhotographer ? "Professional Photographer" : "Client Member"}
                    </p>
                  </div>
                </div>

                {/* Location & Rate pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </span>
                  )}
                  {isPhotographer && Number(profile.hourlyRate) > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold">
                      ${profile.hourlyRate}/hr
                    </span>
                  )}
                  {isPhotographer && Number(profile.experience) > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium">
                      <Clock className="h-3 w-3" />
                      {profile.experience} yrs exp
                    </span>
                  )}
                </div>

                {/* Bio Snippet */}
                {profile.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed border-t border-border/40 pt-3">
                    {profile.bio}
                  </p>
                )}

                {/* Specialties tags preview */}
                {isPhotographer && (profile.specialties || []).length > 0 && (
                  <div className="space-y-1.5 border-t border-border/40 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Specialties
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {profile.specialties?.slice(0, 4).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80"
                        >
                          {spec}
                        </span>
                      ))}
                      {(profile.specialties?.length || 0) > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                          +{(profile.specialties?.length || 0) - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Quick Action in sidebar */}
              <Button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="w-full rounded-xl text-xs font-bold h-11 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-xs transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isDirty ? "Save Changes" : "All Changes Saved"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}