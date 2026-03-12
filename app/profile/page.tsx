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
import { Badge } from "@/components/ui/badge";
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
    Save,
    Loader2,
    Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
    "Wedding", "Portrait", "Event", "Nature", "Fashion", "Sports", "Travel", "Product", "Studio", "Commercial", "Editorial", "Architecture"
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

                // Fetch Portfolio if photographer
                if (profileData?.role === "photographer") {
                    const { data: portfolioData } = await supabase
                        .from("photographer_portfolio")
                        .select("*")
                        .eq("photographer_id", user.id);

                    if (portfolioData) setPortfolio(portfolioData);
                }

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

            setProfile(prev => prev ? ({ ...prev, profile_image_url: publicUrl }) : null);
            await supabase.from("profiles").update({ profile_image_url: publicUrl }).eq('id', profile.id);
            toast.success("Profile photo updated");

        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    // Save All Changes
    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const { error } = await supabase.from("profiles").upsert({
                ...profile,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            toast.success("Profile settings saved successfully");
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast.error(`Failed to save profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const displayName = profile?.full_name || "Account Settings";

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white pb-24">
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <Header />
            </div>

            {/* Profile Hero Header */}
            <section className="relative pt-12 md:pt-24 pb-12 overflow-hidden border-b border-border/40 bg-muted/30">
                <div className="container mx-auto max-w-5xl px-6 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        
                        {/* Avatar Section */}
                        <div className="relative group shrink-0">
                            <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-background bg-secondary overflow-hidden shadow-2xl">
                                {profile?.profile_image_url ? (
                                    <img
                                        src={profile?.profile_image_url}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={displayName}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-secondary">
                                        <Camera className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                )}

                                {/* Image Upload Overlay */}
                                <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300 backdrop-blur-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin mb-2" /> : <Camera className="h-6 w-6 text-white mb-2" />}
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{uploading ? "Uploading" : "Update Photo"}</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        {/* Title & Main Info (Editable) */}
                        <div className="flex-1 space-y-6 w-full text-center md:text-left pt-2 md:pt-4">
                            <div className="space-y-4">
                                {profile?.role === "photographer" && (
                                    <Badge variant="outline" className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                        <Award className="w-3 h-3 mr-1.5" /> Verified Creator
                                    </Badge>
                                )}

                                <div className="space-y-3 max-w-lg mx-auto md:mx-0">
                                    <Input
                                        name="full_name"
                                        value={profile?.full_name || ""}
                                        onChange={handleChange}
                                        className="text-4xl md:text-5xl font-bold tracking-tight p-0 border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-center md:text-left"
                                        placeholder="Your Name"
                                    />
                                    <Input
                                        name="role"
                                        value={profile?.role || ""}
                                        disabled
                                        className="text-lg md:text-xl font-medium text-muted-foreground capitalize p-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-center md:text-left cursor-not-allowed opacity-70"
                                        placeholder="Account Role"
                                    />
                                </div>
                            </div>
                            
                            {/* Save Actions */}
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
                                <Button
                                    size="lg"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-xl px-8 font-semibold shadow-lg min-w-[160px]"
                                >
                                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
                                </Button>
                                {profile?.role === "photographer" && (
                                    <Button variant="outline" size="lg" className="rounded-xl px-8 bg-transparent" asChild>
                                        <Link href={`/photographer/${profile.id}`}>
                                            <ExternalLink className="h-4 w-4 mr-2" /> View Public Profile
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="container mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Sidebar: Details Form */}
                    <div className="lg:col-span-12 space-y-12">
                        
                        {/* Contact Information */}
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 border-b border-border/50 pb-4">
                                <Mail className="h-5 w-5 text-accent" /> Contact Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                    <Input disabled value={profile?.email || ""} className="bg-secondary/20 h-12 rounded-xl text-muted-foreground cursor-not-allowed border-transparent" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="phone" value={profile?.phone || ""} onChange={handleChange} placeholder="+1 (555) 000-0000" className="pl-11 bg-secondary/30 h-12 rounded-xl border-transparent focus-visible:ring-accent transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input name="location" value={profile?.location || ""} onChange={handleChange} placeholder="City, State, Country" className="pl-11 bg-secondary/30 h-12 rounded-xl border-transparent focus-visible:ring-accent transition-all" />
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Professional Information */}
                        {profile?.role === "photographer" && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 border-b border-border/50 pb-4">
                                    <Briefcase className="h-5 w-5 text-accent" /> Professional Overview
                               </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hourly Rate ($)</Label>
                                        <Input name="hourly_rate" type="number" value={profile?.hourly_rate || ""} onChange={handleChange} placeholder="150" className="bg-secondary/30 h-12 rounded-xl border-transparent font-semibold focus-visible:ring-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Years Experience</Label>
                                        <Input name="experience" type="number" value={profile?.experience || ""} onChange={handleChange} placeholder="5" className="bg-secondary/30 h-12 rounded-xl border-transparent font-semibold focus-visible:ring-accent transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Biography & Creative Vision</Label>
                                    <Textarea
                                        name="bio"
                                        value={profile?.bio || ""}
                                        onChange={handleChange}
                                        className="min-h-[160px] bg-secondary/30 border-transparent rounded-xl resize-none leading-relaxed focus-visible:ring-accent transition-all p-5"
                                        placeholder="Describe your style, vision, and what makes your work unique..."
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Creative Specialties</Label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {AVAILABLE_SPECIALTIES.map(tech => {
                                            const isSelected = profile?.specialties?.includes(tech);
                                            return (
                                                <button
                                                    key={tech}
                                                    onClick={() => toggleSpecialty(tech)}
                                                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 ${isSelected
                                                        ? "bg-foreground text-background border-foreground shadow-md"
                                                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                                                        }`}
                                                >
                                                    {tech}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">External Portfolio Link</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            name="portfolio_url"
                                            value={profile?.portfolio_url || ""}
                                            onChange={handleChange}
                                            className="pl-11 bg-secondary/30 h-12 rounded-xl border-transparent focus-visible:ring-accent transition-all"
                                            placeholder="https://your-portfolio.com"
                                        />
                                    </div>
                                </div>
                            </motion.section>
                        )}
                        
                        {/* Portfolio Gallery Preview */}
                        {profile?.role === "photographer" && (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-6 pt-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                     <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-accent" /> Selected Works
                                    </h2>
                                    <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent/80 font-semibold hidden sm:flex">
                                        <Link href="/dashboard/portfolio">Manage Portfolio →</Link>
                                    </Button>
                                </div>

                                {portfolio.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {portfolio.map((item) => (
                                            <div key={item.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
                                                <img
                                                    src={item.image_url[0]}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                                    <h4 className="text-base font-bold text-white line-clamp-1">{item.title}</h4>
                                                    <p className="text-xs text-white/70 line-clamp-1 mt-1">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link href="/dashboard/portfolio" className="group aspect-[4/5] rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center gap-3 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
                                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Camera className="text-muted-foreground group-hover:text-accent transition-colors h-5 w-5" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">Add New Work</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                                        <Camera className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold">Empty Gallery</h4>
                                        <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
                                            Your portfolio is the most critical part of your profile. Start building it now to attract clients.
                                        </p>
                                        <Button asChild className="rounded-xl px-6">
                                            <Link href="/dashboard/portfolio">Upload First Collection</Link>
                                        </Button>
                                    </div>
                                )}
                                <Button asChild variant="outline" size="lg" className="w-full sm:hidden rounded-xl bg-transparent">
                                    <Link href="/dashboard/portfolio">Manage Portfolio</Link>
                                </Button>
                            </motion.section>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}