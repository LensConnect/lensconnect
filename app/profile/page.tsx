"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Camera,
    MapPin,
    Mail,
    Phone,
    Globe,
    Star,
    Briefcase,
    ExternalLink,
    Award,
    Save
} from "lucide-react";

interface ProfileData {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    profile_image_url?: string;
    phone?: string;
    bio?: string;
    location?: string;
    experience?: number;
    hourly_rate?: number;
    specialties?: string[];
    portfolio_url?: string;
    availability?: boolean;
}

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image_url: string[];
    category: string[];
    location: string;
}

const AVAILABLE_SPECIALTIES = [
    "Wedding", "Portrait", "Event", "Nature", "Fashion", "Sports", "Travel", "Product", "Studio"
];

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Combined State
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

    // Image Upload Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchProfileData() {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    router.push("/login");
                    return;
                }

                // 1. Fetch Unified Profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error("Error fetching profile:", profileError);
                } else {
                    setProfile({
                        ...profileData,
                        id: user.id
                    });
                }

                // 3. Fetch Portfolio
                const { data: portfolioData, error: portfolioError } = await supabase
                    .from("photographer_portfolio")
                    .select("*")
                    .eq("photographer_id", user.id);

                if (portfolioData) setPortfolio(portfolioData);

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProfileData();
    }, [router]);

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? ({
            ...prev,
            [name]: name === 'hourly_rate' || name === 'experience' ? Number(value) : value
        }) : null);
    };

    // Handle Specialties Toggle
    const toggleSpecialty = (specialty: string) => {
        setProfile(prev => {
            if (!prev) return null;
            const current = prev.specialties || [];
            const updated = current.includes(specialty)
                ? current.filter(s => s !== specialty)
                : [...current, specialty];
            return { ...prev, specialties: updated };
        });
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        setUploading(true);
        try {
            const filePath = `${profile.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("profile_image")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("profile_image")
                .getPublicUrl(filePath);

            // Update local state immediately
            setProfile(prev => prev ? ({ ...prev, profile_image_url: publicUrl }) : null);

            // Save to DB immediately
            await supabase.from("profiles").update({ profile_image_url: publicUrl }).eq('id', profile.id);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    // Save All Changes
    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            // Update Unified Profile
            const { error } = await supabase.from("profiles").upsert({
                ...profile,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;

            alert("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error saving profile:", error);
            alert(`Failed to save profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-light tracking-widest uppercase text-xs">Developing Vision...</p>
                </div>
            </div>
        );
    }

    const displayName = profile?.full_name || "Artist";
    // const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : "2025";

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-primary/30 font-sans">
            <Header />

            {/* Profile Hero Header */}
            <section className="relative min-h-[50vh] pt-24 pb-12 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)/10,transparent_50%),radial-gradient(circle_at_bottom_left,var(--accent)/5,transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/40 to-[#0D0D0D]" />

                <div className="container mx-auto max-w-7xl px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end gap-10">

                        {/* Avatar Section */}
                        <div className="relative group shrink-0 mx-auto lg:mx-0">
                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-primary/50 to-accent rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-700"></div>
                            <div className="relative h-48 w-48 md:h-64 md:w-64 rounded-full border-4 border-[#0D0D0D] bg-secondary/50 overflow-hidden shadow-2xl">
                                {profile?.profile_image_url ? (
                                    <img
                                        src={profile.profile_image_url}
                                        className="h-full w-full object-cover transition-all duration-700"
                                        alt={displayName}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-primary/5">
                                        <Camera className="h-16 w-16 text-primary/40" />
                                    </div>
                                )}

                                {/* Image Upload Overlay */}
                                <div
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300 backdrop-blur-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-8 w-8 text-white mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">Change Photo</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            {uploading && <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-bold text-primary animate-pulse">Uploading...</div>}
                        </div>

                        {/* Title & Main Info (Editable) */}
                        <div className="flex-1 space-y-6 w-full text-center lg:text-left">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Award className="w-3 h-3" />
                                    <span>Verified Creator</span>
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        name="full_name"
                                        value={profile?.full_name || ""}
                                        onChange={handleChange}
                                        className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase p-0 border-0 bg-transparent placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-center lg:text-left"
                                        placeholder="YOUR NAME"
                                    />
                                    <Input
                                        name="role"
                                        value={profile?.role || ""}
                                        onChange={handleChange}
                                        className="text-xl md:text-2xl font-light tracking-widest uppercase text-white/50 p-0 border-0 bg-transparent placeholder:text-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-center lg:text-left"
                                        placeholder="YOUR ROLE (e.g. VISUAL ARTIST)"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground text-sm font-medium tracking-wide">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span className="opacity-80">{profile?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <Input
                                        name="phone"
                                        value={profile?.phone || ""}
                                        onChange={handleChange}
                                        className="p-0 border-0 bg-transparent h-auto w-[150px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <Input
                                        name="location"
                                        value={profile?.location || ""}
                                        onChange={handleChange}
                                        className="p-0 border-0 bg-transparent h-auto w-[150px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex flex-col gap-3 pb-2 w-full lg:w-auto">
                            <Button
                                size="2xl"
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-full px-10 shadow-[0_0_40px_-10px_var(--primary)] hover:scale-105 transition-transform active:scale-95"
                            >
                                {saving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" /> Save Changes
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" size="2xl" className="rounded-full px-8 border-white/5 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.08] transition-all">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Public Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="container mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Sidebar: Details Form */}
                    <aside className="lg:col-span-4 space-y-8">
                        {profile?.role === "Photographer" && (
                            <div className="p-6 rounded-3xl bg-secondary/10 border border-white/5 text-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hourly Rate</Label>
                                <div className="flex items-center justify-center mt-2">
                                    <span className="text-xl text-primary font-bold">$</span>
                                    <Input
                                        name="hourly_rate"
                                        type="number"
                                        value={profile?.hourly_rate || ""}
                                        onChange={handleChange}
                                        className="text-3xl font-black bg-transparent border-0 text-center w-24 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stats / Quick Info */}
                        {profile?.role === "photographer" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-secondary/10 border border-white/5 text-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hourly Rate</Label>
                                <div className="flex items-center justify-center mt-2">
                                    <span className="text-xl text-primary font-bold">$</span>
                                    <Input
                                        name="hourly_rate"
                                        type="number"
                                        value={profile?.hourly_rate || ""}
                                        onChange={handleChange}
                                        className="text-3xl font-black bg-transparent border-0 text-center w-24 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-secondary/10 border border-white/5 text-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Experience</Label>
                                <div className="flex items-center justify-center mt-2">
                                    <Input
                                        name="experience"
                                        type="number"
                                        value={profile?.experience || ""}
                                        onChange={handleChange}
                                        className="text-3xl font-black bg-transparent border-0 text-center w-20 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                        placeholder="0"
                                    />
                                    <span className="text-sm font-bold text-muted-foreground ml-1">Yrs</span>
                                </div>
                            </div>
                        </div>
                        )}
                        {/* Bio Section */}

                        {profile?.role === "photographer" && (
                        <div className="space-y-4 p-8 rounded-[2rem] bg-secondary/5 border border-white/5">
                            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> About You
                            </h2>
                            <Textarea
                                name="bio"
                                value={profile?.bio || ""}
                                onChange={handleChange}
                                className="min-h-[150px] bg-black/20 border-white/10 rounded-xl resize-none text-muted-foreground leading-relaxed focus:border-primary/50 transition-colors"
                                placeholder="Tell your story. Describe your style, vision, and what makes your work unique..."
                            />
                        </div>
                        )}

                        {/* Specialties Section */}
                        {profile?.role === "photographer" && (
                        <div className="space-y-4 p-8 rounded-[2rem] bg-secondary/5 border border-white/5">
                            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                                <Star className="h-4 w-4" /> Specialties
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SPECIALTIES.map(tech => {
                                    const isSelected = profile?.specialties?.includes(tech);
                                    return (
                                        <button
                                            key={tech}
                                            onClick={() => toggleSpecialty(tech)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${isSelected
                                                ? "bg-primary text-black border-primary"
                                                : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {tech}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}
                        {/* Web Links */}
                        <div className="space-y-4 p-8 rounded-[2rem] bg-secondary/5 border border-white/5">
                            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Online Presence
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-[10px] uppercase text-muted-foreground mb-1.5 block">Portfolio URL</Label>
                                    <Input
                                        name="portfolio_url"
                                        value={profile?.portfolio_url || ""}
                                        onChange={handleChange}
                                        className="bg-black/20 border-white/10 rounded-lg h-9 text-sm"
                                        placeholder="https://your-portfolio.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content: Portfolio Gallery Preview */}
                    {profile?.role === "photographer" && (
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-end justify-between border-b border-white/5 pb-2">
                            <div className="space-y-2">
                                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">Your Work</h2>
                                <h3 className="text-3xl font-black uppercase tracking-tight">Portfolio Preview</h3>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Link href="/dashboard/portfolio">Manage Portfolio →</Link>
                            </Button>
                        </div>

                        {portfolio.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {portfolio.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative h-[300px] rounded-3xl overflow-hidden bg-secondary/30 ring-1 ring-white/5 hover:ring-primary/20 transition-all duration-500"
                                    >
                                        <img
                                            src={item.image_url[0]}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-1">{item.title}</h4>
                                            <p className="text-xs text-white/60 line-clamp-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {/* Add New Placeholder */}
                                <Link href="/dashboard/portfolio" className="group h-[300px] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="text-white/20 group-hover:text-primary transition-colors h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">Add New Work</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-6 bg-secondary/5 rounded-[3rem] border border-dashed border-white/10">
                                <div className="h-20 w-20 mx-auto rounded-full bg-primary/5 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-primary/30" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-widest text-white/50">Empty Gallery</h4>
                                    <p className="text-muted-foreground text-xs font-light max-w-xs mx-auto">
                                        Your portfolio is the most critical part of your profile. Start building it now.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10">
                                    <Link href="/dashboard/portfolio">Upload Collection</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
}