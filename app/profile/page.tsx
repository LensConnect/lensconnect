"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateReactHelpers } from "@uploadthing/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Check,
  Eye,
  Image as ImageIcon,
  Info,
  LoaderCircle,
  MapPin,
  Upload,
  UserRound,
} from "lucide-react";

import { saveProfileImage } from "@/app/actions/profile";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const specialties = [
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

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

type UserRole = "photographer" | "client";

type ProfileData = {
  id: number;
  photographerProfileId?: number;
  fullname: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  hourly_rate?: number;
  experience?: number;
  specialties?: string[];
  profile_image_url?: string;
  website?: string;
  availability?: boolean;
};

type PortfolioItem = {
  id: number | string;
  title: string;
  description?: string;
  location?: string;
  category?: string[];
  image_url?: string[] | string;
};

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: async (result) => {
      const uploadedUrl = result?.[0]?.ufsUrl || result?.[0]?.url;
      if (!uploadedUrl || !user?.id) {
        toast.error("Upload completed without a usable profile photo URL.");
        setUploading(false);
        return;
      }

      try {
        const saved = await saveProfileImage(Number(user.id), uploadedUrl);
        if (!saved.success) {
          throw new Error(saved.error || "Could not save the profile photo.");
        }

        setProfile((current) => current ? { ...current, profile_image_url: uploadedUrl } : current);
        setSavedProfile((current) => current ? { ...current, profile_image_url: uploadedUrl } : current);
        await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        await queryClient.invalidateQueries({ queryKey: ["profile-image", user.id] });
        toast.success("Profile photo saved.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save the profile photo.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    onUploadError: (error) => {
      toast.error(error.message || "Could not upload the profile photo.");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<ProfileData | null>({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id) && !authLoading,
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/profiles?userId=${user.id}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Could not load your profile.");
      }
      const data = await response.json();
      return data.result ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!profileData) return;
    const normalized: ProfileData = {
      ...profileData,
      hourlyRate: profileData.hourlyRate ?? profileData.hourly_rate ?? 0,
      experience: profileData.experience ?? 0,
      specialties: Array.isArray(profileData.specialties) ? profileData.specialties : [],
      phoneNumber: profileData.phoneNumber || "",
      bio: profileData.bio || "",
      location: profileData.location || "",
      website: profileData.website || "",
      profile_image_url: profileData.profile_image_url || "",
      availability: profileData.availability ?? true,
    };
    setProfile(normalized);
    setSavedProfile(normalized);
    setIsDirty(false);
  }, [profileData]);

  const photographerProfileId = profile?.photographerProfileId;
  const { data: portfolioResponse } = useQuery<{ portfolios?: PortfolioItem[] }>({
    queryKey: ["portfolios", photographerProfileId],
    enabled: Boolean(photographerProfileId) && profile?.role === "photographer",
    queryFn: async () => {
      const response = await fetch(`/api/portfolios?photographerId=${photographerProfileId}`);
      if (!response.ok) throw new Error("Could not load portfolio collections.");
      return response.json();
    },
    staleTime: 1000 * 60 * 3,
  });
  const portfolios = portfolioResponse?.portfolios ?? [];
  const isPhotographer = profile?.role === "photographer";
  const publicProfileHref = profile?.photographerProfileId
    ? `/photographer/${encodeURIComponent(profile.fullname || "photographer")}/${profile.photographerProfileId}`
    : null;

  const updateField = (name: keyof ProfileData, value: ProfileData[keyof ProfileData]) => {
    setProfile((current) => current ? { ...current, [name]: value } : current);
    setIsDirty(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const numericField = name === "hourlyRate" || name === "experience";
    updateField(
      name as keyof ProfileData,
      numericField ? (value === "" ? undefined : Math.max(0, Number(value))) : value,
    );
  };

  const toggleSpecialty = (specialty: string) => {
    if (!profile) return;
    const current = profile.specialties ?? [];
    updateField(
      "specialties",
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty],
    );
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Choose an image under 4 MB.");
      return;
    }
    setUploading(true);
    await startUpload([file]);
  };

  const handleSave = async () => {
    if (!profile || !user?.id || saving || !isDirty) return;
    if (!profile.fullname.trim()) {
      toast.error("Full name is required.");
      document.getElementById("fullname")?.focus();
      return;
    }

    const payload: Record<string, unknown> = {
      userId: user.id,
      fullname: profile.fullname.trim(),
      bio: profile.bio || "",
      location: profile.location || "",
      phoneNumber: profile.phoneNumber || "",
      website: profile.website || "",
    };
    if (isPhotographer) {
      payload.hourlyRate = Number(profile.hourlyRate) || 0;
      payload.experience = Number(profile.experience) || 0;
      payload.specialties = profile.specialties || [];
      payload.availability = profile.availability ?? true;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/profiles?userId=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Could not save your profile.");
      }
      const saved = { ...profile, fullname: profile.fullname.trim() };
      setProfile(saved);
      setSavedProfile(saved);
      setIsDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile changes saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || profileLoading || !user) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Header />
        <main className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center gap-3 px-5 text-center" role="status">
          <LoaderCircle className="size-6 animate-spin text-forest" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </main>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Header />
        <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-start justify-center gap-4 px-5 py-12">
          <h1 className="font-serif text-4xl tracking-tight">Profile unavailable</h1>
          <p className="text-[15px] leading-7 text-muted-foreground">
            {profileError instanceof Error ? profileError.message : "We couldn’t find profile details for this account."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild><Link href="/">Return home</Link></Button>
            <Button onClick={() => void refetchProfile()}>Try again</Button>
          </div>
        </main>
      </div>
    );
  }

  const preview = savedProfile ?? profile;
  const previewImage = preview.profile_image_url;
  const previewRate = Number(preview.hourlyRate) || 0;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <div className="sticky top-[72px] z-30 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[60px] max-w-[1320px] items-center justify-between gap-3 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={isPhotographer ? "/dashboard" : "/dashboard/client"} aria-label="Back to dashboard" className="inline-flex size-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
              <ArrowLeft className="size-[18px]" aria-hidden="true" />
            </Link>
            <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Profile settings</p>
              <p className={`text-xs ${isDirty ? "text-[#765829]" : "text-muted-foreground"}`} role="status" aria-live="polite">
                {isDirty ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {isPhotographer && publicProfileHref && (
              <Button variant="ghost" asChild className="hidden min-h-11 px-3 text-[13px] font-semibold text-forest sm:inline-flex">
                <Link href={publicProfileHref} target="_blank" rel="noreferrer"><Eye className="size-4" aria-hidden="true" />Public profile</Link>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !isDirty} className="min-h-11 rounded-none px-4 text-[13px] font-semibold sm:px-5">
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1320px] px-5 pb-20 pt-8 sm:px-8 sm:pt-11">
        <div className="mb-8 max-w-[710px] sm:mb-10">
          <h1 className="font-serif text-[38px] leading-[1.04] tracking-[-0.045em] sm:text-5xl">Edit the details clients see.</h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-muted-foreground">
            Keep your contact information, photography specialties, and portfolio details up to date.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-12">
          <div className="min-w-0">
            <nav aria-label="Profile sections" className="mb-5 flex gap-1 overflow-x-auto border-b border-line text-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <a className="inline-flex min-h-12 shrink-0 items-center px-3 font-semibold text-forest hover:text-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-4" href="#general-info">General Info</a>
              {isPhotographer && <>
                <a className="inline-flex min-h-12 shrink-0 items-center px-3 font-medium text-muted-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-4" href="#rates-specialties">Rates &amp; Specialties</a>
                <a className="inline-flex min-h-12 shrink-0 items-center px-3 font-medium text-muted-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-4" href="#works-portfolio">Works &amp; Portfolio</a>
              </>}
              <a className="inline-flex min-h-12 shrink-0 items-center px-3 font-medium text-muted-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-4" href="#account">Account</a>
            </nav>

            <div className="divide-y divide-line border-y border-line bg-white">
              <section id="general-info" aria-labelledby="general-heading" className="scroll-mt-36 px-5 py-6 sm:px-7 sm:py-7">
                <div className="mb-6">
                  <h2 id="general-heading" className="text-[17px] font-semibold tracking-tight">General Info</h2>
                  <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Your name and contact details appear on your profile.</p>
                </div>

                <div className="mb-6 flex flex-col gap-4 bg-wash p-4 sm:flex-row sm:items-center">
                  <div className="flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-line-strong bg-paper text-muted-foreground">
                    {profile.profile_image_url ? <Image src={profile.profile_image_url} alt={`${profile.fullname} profile photo`} width={152} height={152} className="size-full object-cover" unoptimized /> : <Camera className="size-6" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Profile photo</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Choose a clear portrait for your public profile. Photo uploads are saved as soon as they finish.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Maximum file size: 4 MB.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageUpload} aria-label="Choose profile photo" />
                  <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="min-h-11 shrink-0 rounded-none bg-white px-4 text-[13px] font-semibold">
                    {uploading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
                    {uploading ? "Uploading…" : "Upload photo"}
                  </Button>
                </div>

                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-[13px] font-semibold">Full name</Label>
                    <Input id="fullname" name="fullname" autoComplete="name" value={profile.fullname || ""} onChange={handleChange} className="h-11 rounded-none border-input bg-white text-sm focus-visible:ring-forest/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[13px] font-semibold">Email address <span className="ml-2 text-xs font-normal text-muted-foreground">From your account</span></Label>
                    <Input id="email" type="email" autoComplete="email" readOnly value={profile.email || ""} className="h-11 rounded-none border-line bg-[#f7f6f2] text-sm text-muted-foreground" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-[13px] font-semibold">Phone number</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" value={profile.phoneNumber || ""} onChange={handleChange} placeholder="Add a phone number" className="h-11 rounded-none border-input bg-white text-sm focus-visible:ring-forest/20" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-[13px] font-semibold">Location / city</Label>
                    <Input id="location" name="location" autoComplete="address-level2" value={profile.location || ""} onChange={handleChange} placeholder="City or region" className="h-11 rounded-none border-input bg-white text-sm focus-visible:ring-forest/20" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="bio" className="text-[13px] font-semibold">{isPhotographer ? "Biography" : "About you"}</Label>
                      <span className="text-xs text-muted-foreground">{(profile.bio || "").length} / 400</span>
                    </div>
                    <Textarea id="bio" name="bio" maxLength={400} rows={3} value={profile.bio || ""} onChange={handleChange} placeholder={isPhotographer ? "Describe your photography style and the work you take on." : "Tell photographers about your projects and collaboration goals."} className="min-h-24 resize-y rounded-none border-input bg-white text-sm leading-6 focus-visible:ring-forest/20" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="website" className="text-[13px] font-semibold">Website / online portfolio</Label>
                    <Input id="website" name="website" type="url" autoComplete="url" value={profile.website || ""} onChange={handleChange} placeholder="https://example.com" className="h-11 rounded-none border-input bg-white text-sm focus-visible:ring-forest/20" />
                  </div>
                </div>
              </section>

              {isPhotographer && <>
                <section id="rates-specialties" aria-labelledby="rates-heading" className="scroll-mt-36 px-5 py-6 sm:px-7 sm:py-7">
                  <div className="mb-5">
                    <h2 id="rates-heading" className="text-[17px] font-semibold tracking-tight">Rates &amp; Specialties</h2>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Help clients understand your experience and the photography you offer.</p>
                  </div>
                  <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="hourlyRate" className="text-[13px] font-semibold">Hourly rate (NGN)</Label>
                      <div className="flex h-11 items-center border border-input bg-white px-3.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-forest">
                        <span className="mr-2 text-sm text-muted-foreground">₦</span>
                        <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="1" value={profile.hourlyRate ?? ""} onChange={handleChange} placeholder="Set your hourly rate" className="h-full min-w-0 rounded-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">This is your listed hourly rate, not a project total.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="experience" className="text-[13px] font-semibold">Years of experience</Label>
                      <Input id="experience" name="experience" type="number" min="0" max="80" value={profile.experience ?? ""} onChange={handleChange} placeholder="Years in photography" className="h-11 rounded-none border-input bg-white text-sm focus-visible:ring-forest/20" />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-semibold">Available for new bookings</p>
                      <p className="mt-1 max-w-[430px] text-[13px] leading-5 text-muted-foreground">Let clients know if you’re currently accepting booking requests.</p>
                    </div>
                    <div className="inline-flex min-h-11 items-center gap-3 self-start sm:self-auto">
                      <Switch id="availability" checked={profile.availability ?? true} onCheckedChange={(checked) => updateField("availability", checked)} aria-label="Available for new bookings" />
                      <Label htmlFor="availability" className="text-[13px] font-medium">{profile.availability ? "Available" : "Unavailable"}</Label>
                    </div>
                  </div>
                  <fieldset className="mt-5 border-t border-line pt-5">
                    <legend className="mb-2 text-[13px] font-semibold">Creative specialties</legend>
                    <p className="mb-3 text-[13px] text-muted-foreground">Choose the types of photography clients can find you for.</p>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => {
                        const selected = profile.specialties?.includes(specialty) ?? false;
                        return (
                          <button key={specialty} type="button" aria-pressed={selected} onClick={() => toggleSpecialty(specialty)} className={`inline-flex min-h-10 items-center border px-3.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${selected ? "border-forest bg-forest text-white" : "border-input bg-white text-ink hover:border-forest hover:text-forest"}`}>
                            {specialty}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{profile.specialties?.length ? `${profile.specialties.length} specialties selected` : "No specialties selected."}</p>
                  </fieldset>
                </section>

                <section id="works-portfolio" aria-labelledby="works-heading" className="scroll-mt-36 px-5 py-6 sm:px-7 sm:py-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 id="works-heading" className="text-[17px] font-semibold tracking-tight">Works &amp; Portfolio</h2>
                      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Your collections give clients a closer look at your photography.</p>
                    </div>
                    <Button variant="outline" asChild className="min-h-11 w-fit rounded-none border-input px-4 text-[13px] font-semibold text-forest">
                      <Link href="/dashboard/portfolio"><ImageIcon className="size-4" aria-hidden="true" />Manage portfolio<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                    </Button>
                  </div>
                  {portfolios.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {portfolios.map((item) => {
                        const image = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url;
                        return (
                          <article key={item.id} className="flex min-w-0 gap-4 border-t border-line py-4">
                            <div className="relative size-20 shrink-0 overflow-hidden bg-wash sm:size-24">
                              {image ? <img src={image} alt={item.title} loading="lazy" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-muted-foreground"><ImageIcon className="size-5" aria-hidden="true" /></div>}
                            </div>
                            <div className="min-w-0 py-1">
                              <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                              {item.location && <p className="mt-1 truncate text-[13px] text-muted-foreground">{item.location}</p>}
                              {item.category?.length ? <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.category.join(" · ")}</p> : null}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 flex min-h-[94px] flex-col items-start justify-center gap-1 border border-dashed border-line-strong bg-[#fbfaf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">No portfolio collections added yet.</p>
                        <p className="mt-1 text-[13px] text-muted-foreground">Add a collection from Portfolio to show your work here.</p>
                      </div>
                      <Link href="/dashboard/portfolio" className="mt-2 min-h-11 inline-flex items-center font-semibold text-[13px] text-forest underline underline-offset-4 hover:text-forest-dark sm:mt-0">Add portfolio work</Link>
                    </div>
                  )}
                </section>
              </>}

              <section id="account" aria-labelledby="account-heading" className="scroll-mt-36 px-5 py-6 sm:px-7 sm:py-7">
                <div>
                  <h2 id="account-heading" className="text-[17px] font-semibold tracking-tight">Account</h2>
                  <p className="mt-1 text-[13px] leading-5 text-muted-foreground">Account details are managed separately from your profile.</p>
                </div>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="border-t border-line pt-3"><dt className="text-xs font-medium text-muted-foreground">Account role</dt><dd className="mt-1.5 text-sm font-semibold capitalize">{profile.role}</dd></div>
                  <div className="border-t border-line pt-3"><dt className="text-xs font-medium text-muted-foreground">Account ID</dt><dd className="mt-1.5 text-sm text-muted-foreground">{profile.id}</dd></div>
                </dl>
              </section>
            </div>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-[154px]">
            {isPhotographer ? (
              <section aria-labelledby="preview-heading" className="border border-line bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                  <div>
                    <h2 id="preview-heading" className="text-[15px] font-semibold">Public profile preview</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Only saved profile details appear here.</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"><Eye className="size-4" aria-hidden="true" />Preview</span>
                </div>
                <div className="mt-5 flex items-center gap-3.5">
                  <div className="flex size-[62px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-line-strong bg-paper text-muted-foreground">
                    {previewImage ? <img src={previewImage} alt="Saved profile portrait" className="size-full object-cover" /> : <UserRound className="size-5" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{preview.fullname || "Add your name"}</p>
                    <p className="mt-1 truncate text-[13px] text-muted-foreground">{preview.location || "Add your location"}</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-xs font-semibold text-muted-foreground">Photography specialties</p>
                  <p className="mt-2 text-[13px] text-muted-foreground">{preview.specialties?.length ? preview.specialties.join(" · ") : "No specialties selected"}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-y border-line py-3 text-[13px]">
                  <span className="text-muted-foreground">Hourly rate</span>
                  <span className={previewRate ? "font-medium" : "text-muted-foreground"}>{previewRate ? `${formatNaira(previewRate)} / hour` : "Add a rate"}</span>
                </div>
                <div className="mt-4 flex min-h-[115px] flex-col items-center justify-center border border-dashed border-line-strong bg-[#fbfaf7] px-4 py-5 text-center">
                  <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-[13px] font-medium">{portfolios.length ? `${portfolios.length} portfolio ${portfolios.length === 1 ? "collection" : "collections"}` : "No portfolio images yet"}</p>
                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">{portfolios.length ? "Your portfolio collections appear on your public profile." : "Add a collection to show your work on your profile."}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" disabled={!publicProfileHref} asChild={Boolean(publicProfileHref)} className="min-h-10 rounded-none border-line text-xs font-semibold">
                    {publicProfileHref ? <Link href={publicProfileHref} target="_blank" rel="noreferrer">View profile</Link> : <span>View profile</span>}
                  </Button>
                  <Button type="button" disabled={!preview.availability || !previewRate} className="min-h-10 rounded-none text-xs font-semibold">Request booking</Button>
                </div>
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">This preview reflects saved details. Save your edits to update it.</p>
              </section>
            ) : (
              <section className="border border-line bg-white p-5 sm:p-6">
                <h2 className="text-[15px] font-semibold">Account profile</h2>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">Your contact details help photographers respond to your booking requests.</p>
              </section>
            )}
            <div className="mt-4 flex gap-3 border-l-2 border-forest py-1 pl-4 text-[13px] leading-5 text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden="true" />
              <p>Your profile photo saves immediately after upload. Other edits remain unsaved until you choose <strong className="font-semibold text-ink">Save changes</strong>.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
