"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import {
  Search,
  Calendar,
  Camera,
  ArrowRight,
  MapPin,
  Image as ImageIcon,
  Star
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const MotionLink = motion(Link);

interface UserProfile {
  id: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  const handleContentRole = async () => {
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !authUser) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      setUser({
        role: profile.role,
        id: authUser.id,
      });
    }
  };

  useEffect(() => {
    handleContentRole();
  }, []);

  const categories = [
    { name: "Editorial", count: "1,234", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
    { name: "Wedding", count: "892", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80" },
    { name: "Commercial", count: "567", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
    { name: "Architecture", count: "423", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
    { name: "Portrait", count: "2,104", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
  ];

  const processSteps = [
    { icon: Search, title: "Search & Discover", description: "Find top-tier professionals by exact visual style, budget, and availability." },
    { icon: Camera, title: "Review Portfolios", description: "Immerse yourself in full-screen, uncompressed galleries from verified artists." },
    { icon: Calendar, title: "Seamless Booking", description: "Secure dates instantly with transparent pricing and milestone payments." }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Marketing Director",
      content: "LensConnect has transformed how we source talent for our editorial shoots. The quality of photographers is unmatched.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Marcus Chen",
      role: "Freelance Producer",
      content: "The booking process is seamless. I can find a photographer, review their portfolio, and secure a date in minutes.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Elena Rodriguez",
      role: "Wedding Planner",
      content: "My clients demand the best, and LensConnect delivers every time. The verified artist system gives me peace of mind.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const featuredCreators = [
    {
      name: "Alex Rivera",
      specialty: "Commercial & Editorial",
      image: "https://images.unsplash.com/photo-1621570074981-ee6a6ade4445?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviews: 124
    },
    {
      name: "Samantha Vogt",
      specialty: "Architecture & Interior",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      rating: 5.0,
      reviews: 89
    },
    {
      name: "David Kim",
      earth: "Lagos, NG",
      specialty: "Street & Portrait",
      image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviews: 210
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground tracking-tight selection:bg-accent selection:text-white font-sans">
      {/* Glassmorphic Header */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-colors">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-white pt-20">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              style={{ opacity: heroOpacity, y: heroY }}
              className="space-y-8 text-left"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/10 bg-primary/5 mb-4"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Join 2,000+ Verified Artists</span>
              </motion.div>

              <div className="relative">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1 }}
                  className="text-6xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-[0.95] text-foreground"
                >
                  Find Your Lens.<br />
                  <span className="text-primary">Capture</span> Reality.
                </motion.h1>
                {/* Hand-drawn squiggle */}
                <svg className="absolute -top-10 -left-10 w-24 h-24 text-primary/20" viewBox="0 0 100 100">
                  <path d="M20,80 Q40,20 80,50 T100,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-xl font-medium leading-relaxed"
              >
                The world's premier network for high-end photography and visual storytelling. Connect with elite talent for your next defining campaign.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 group">
                  Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-16 px-10 text-lg font-bold border-border/50 bg-white/50 backdrop-blur-sm hover:bg-muted">
                  View Showcase
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Image Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative aspect-square lg:aspect-auto lg:h-[700px]"
            >
              {/* Main Central Image */}
              <div className="absolute inset-0 top-10 right-0 bottom-10 left-10 overflow-hidden rounded-[4rem] shadow-2xl border-8 border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80" 
                  alt="Photography" 
                  fill 
                  className="object-cover"
                />
              </div>

              {/* Floating Image 1 (Top Left) */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 left-0 w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20"
              >
                <Image 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" 
                  alt="Portrait" 
                  fill 
                  className="object-cover"
                />
              </motion.div>

              {/* Floating Image 2 (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 right-0 w-56 h-56 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white z-20"
              >
                <Image 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                  alt="Editorial" 
                  fill 
                  className="object-cover"
                />
              </motion.div>

              {/* Functional Search Box - Floating over imagery */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-30">
                <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-primary/10 flex items-center">
                  <div className="flex-1 px-6 py-2 border-r border-border/50 hidden md:block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Where</span>
                    <input type="text" placeholder="London, NY..." className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                  </div>
                  <div className="flex-1 px-6 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Specialty</span>
                    <input type="text" placeholder="All Categories" className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                  </div>
                  <Button className="h-14 w-14 rounded-full p-0 shrink-0 bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <Search className="h-6 w-6 text-white" />
                  </Button>
                </div>
              </div>

              {/* Decorative Sparkles */}
              <Star className="absolute top-20 right-10 w-8 h-8 text-primary/20 fill-primary/10 animate-spin-slow" />
              <div className="absolute bottom-20 left-0 w-4 h-4 rounded-full bg-primary/20 animate-ping" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 md:py-32 px-6 bg-white overflow-hidden relative border-b border-border/30">
        <motion.div
           initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
           className="container mx-auto px-0 mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[2px] bg-primary" />
            <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">Discover Excellence</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight max-w-2xl leading-[0.95]">
              Explore Premium <br /><span className="text-muted-foreground/30">Categories.</span>
            </h2>
            <Button asChild variant="outline" className="rounded-full px-10 h-14 font-bold border-border/50 hover:bg-muted hidden md:flex">
              <Link href="/search">View All Disciplines</Link>
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 hide-scrollbar pr-12">
          {categories.map((category, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              key={category.name}
              className="snap-start shrink-0 w-[300px] md:w-[400px]"
            >
              <Link href={`/search?category=${category.name.toLowerCase()}`} className="block relative group">
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image 
                    src={category.image} 
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/70 mb-2 uppercase">
                      {category.count} Verified Artists
                    </p>
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{category.name}</h3>
                  </div>
                  <div className="absolute top-10 right-10 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                     <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
          >
           <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[2px] bg-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">Elite Talent</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
                Master <br /><span className="text-muted-foreground/30">Creators.</span>
              </h2>
           </div>
           <Button asChild variant="link" className="text-primary font-black text-lg p-0 hover:no-underline group">
             <Link href="/photographers" className="flex items-center gap-3">
               Meet more visionaries <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
             </Link>
           </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {featuredCreators.map((creator, i) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-100 shadow-2xl mb-8">
                   <Image 
                    src={creator.image} 
                    alt={creator.name} 
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">{creator.specialty}</p>
                  <h3 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">{creator.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                    </div>
                    <span className="text-sm font-bold">{creator.rating}</span>
                    <span className="text-sm text-muted-foreground">({creator.reviews} reviews)</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative background squiggle */}
        <svg className="absolute -bottom-20 -left-20 w-[600px] h-[600px] text-white pointer-events-none" viewBox="0 0 100 100">
           <path d="M10,90 Q30,10 90,50 T150,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="text-center mb-24"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">The Workflow</span>
              <div className="w-12 h-[2px] bg-primary" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">Zero Friction <br /><span className="text-muted-foreground/30">Booking.</span></h2>
          </motion.div>

          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-3 gap-16"
          >
            {processSteps.map((step, index) => (
              <motion.div variants={fadeIn} key={step.title} className="relative group text-center md:text-left">
                <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white text-primary shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <step.icon className="h-10 w-10" />
                </div>
                <div className="space-y-4">
                  <span className="text-[12px] font-black tracking-[0.3em] uppercase text-muted-foreground/40 block">0{index + 1}</span>
                  <h3 className="text-3xl font-black tracking-tight">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white border-b border-border/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="text-center mb-24"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">Success Stories</span>
              <div className="w-12 h-[2px] bg-primary" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">Community <br /><span className="text-muted-foreground/30">Voices.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-slate-50 p-12 rounded-[3.5rem] flex flex-col justify-between border border-transparent hover:border-primary/10 transition-all hover:bg-white hover:shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xl font-bold leading-relaxed tracking-tight">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-5 mt-12">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg tracking-tight">{t.name}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe Split CTA */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-20 lg:p-32 text-center text-white min-h-[60vh] bg-zinc-950 group">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80" alt="Client" fill className="object-cover" />
          </div>
          <div className="relative z-20 space-y-10 max-w-md">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-[2px] bg-primary" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">For Clients</span>
              <div className="w-8 h-[2px] bg-primary" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              {user?.role === 'client' ? "Your Next Project." : "Hire a Visionary."}
            </h2>
            <p className="text-xl text-white/50 font-medium">
              {user?.role === 'client' 
                ? "Post a new job and find the perfect visual storyteller for your campaign." 
                : "Commission world-class talent for your next defining campaign or life event."}
            </p>
            <Button size="lg" className="rounded-full h-16 px-12 text-lg font-black bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
              <Link href={user?.role === 'client' ? "/dashboard/client/post-job" : "/photographers"}>
                {user?.role === 'client' ? "Post a Job" : "Find a Photographer"}
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-20 lg:p-32 text-center text-zinc-950 min-h-[60vh] bg-white group border-t md:border-t-0 md:border-l border-border/50">
          <div className="absolute inset-0 opacity-5 pointer-events-none grayscale">
            <Image src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80" alt="Artist" fill className="object-cover" />
          </div>
          <div className="relative z-20 space-y-10 max-w-md">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-[2px] bg-primary" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">For Artists</span>
              <div className="w-8 h-[2px] bg-primary" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              {user?.role === 'photographer' ? "Your Portfolio." : "Join the Collective."}
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              {user?.role === 'photographer'
                ? "Manage your bookings, upload new work, and grow your creative business."
                : "Showcase your portfolio to high-end clients and manage your entire business seamlessly."}
            </p>
            <Button size="lg" variant="outline" className="rounded-full h-16 px-12 text-lg font-black border-zinc-950/20 bg-transparent text-zinc-950 hover:bg-zinc-950 hover:text-white transition-all hover:scale-105 active:scale-95">
              <Link href={user?.role === 'photographer' ? "/dashboard" : "/signup?role=photographer"}>
                {user?.role === 'photographer' ? "Go to Dashboard" : "Apply as Talent"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-border/40 py-24 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="LensConnect Logo" 
                width={36} 
                height={36} 
                className="h-9 w-9 object-contain"
              />
              <span className="text-2xl font-black tracking-tight uppercase">LensConnect</span>
            </Link>
            
            <div className="flex flex-wrap justify-center gap-10">
              {['Directory', 'Showcase', 'About', 'Terms', 'Privacy'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <Star className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-border/30 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              © 2026 LensConnect Global. All Rights Reserved. Creative Excellence Defined.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
