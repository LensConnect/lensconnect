"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { supabase } from "@/lib/supabaseClient";

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

const MotionLink = motion(Link);

interface UserProfile {
  id: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
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
    { name: "Editorial", count: "1,234", gradient: "from-zinc-900 to-zinc-800" },
    { name: "Wedding", count: "892", gradient: "from-stone-900 to-stone-800" },
    { name: "Commercial", count: "567", gradient: "from-slate-900 to-slate-800" },
    { name: "Architecture", count: "423", gradient: "from-neutral-900 to-neutral-800" },
    { name: "Portrait", count: "2,104", gradient: "from-gray-900 to-gray-800" },
  ];

  const processSteps = [
    { icon: Search, title: "Search & Discover", description: "Find top-tier professionals by exact visual style, budget, and availability." },
    { icon: Camera, title: "Review Portfolios", description: "Immerse yourself in full-screen, uncompressed galleries from verified artists." },
    { icon: Calendar, title: "Seamless Booking", description: "Secure dates instantly with transparent pricing and milestone payments." }
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
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0a]">
        {/* Abstract Dark Background since Unsplash images are failing */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-[#0a0a0a] to-[#0a0a0a]" />
        
        {/* Cinematic Particles / Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-0" />
        
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container mx-auto px-4 relative z-10 text-center space-y-10 mt-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4"
          >
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/90">The Premium Creative Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter text-white leading-[0.9] max-w-5xl mx-auto"
          >
            Find Your Lens.<br />
            <span className="text-white/60">Capture Reality.</span>
          </motion.h1>

          <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
             className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium"
          >
            Connect with the world's most talented photographers, filmmakers, and creative visionaries.
          </motion.p>

          {/* Elevated Floating Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="max-w-4xl mx-auto bg-white p-2 rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-2 mt-8 ring-1 ring-black/5"
          >
            <div className="flex-1 flex items-center px-4 md:px-6 py-4 border-b md:border-b-0 md:border-r border-border/50">
              <MapPin className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
              <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Where</span>
                <input type="text" placeholder="Location, City" className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 flex items-center px-4 md:px-6 py-4 border-b md:border-b-0 md:border-r border-border/50">
              <Calendar className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
               <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">When</span>
                <input type="text" placeholder="Select Dates" className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1 flex items-center px-4 md:px-6 py-4">
              <ImageIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
               <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">What</span>
                <input type="text" placeholder="Editorial, Wedding..." className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" />
              </div>
            </div>
            <Button size="lg" className="h-auto py-4 md:py-0 md:w-32 rounded-xl md:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shrink-0 mx-2 mb-2 md:my-2 md:mx-2 font-bold text-base shadow-lg">
              Search
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Categories (Using robust gradients instead of images to prevent blank loading states) */}
      <section className="py-24 md:py-32 px-4 md:pl-8 lg:pl-16 bg-background overflow-hidden relative border-b border-border/30">
        <motion.div
           initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
           className="container mx-auto px-0 mb-12 md:mb-16 pr-4 md:pr-8"
        >
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-accent mb-4">
            Curated Categories
          </h2>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <p className="text-4xl md:text-6xl font-black tracking-tight max-w-2xl leading-tight">Explore premium visual arts.</p>
            <Button asChild variant="outline" className="rounded-full px-8 hidden md:flex">
              <Link href="/search">View full index</Link>
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 hide-scrollbar pr-12 md:pl-[calc((100vw-1280px)/2)] pl-4">
          {categories.map((category, i) => (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              key={category.name}
              className="snap-start shrink-0 w-[280px] md:w-[360px] lg:w-[420px]"
            >
              <Link href={`/search?category=${category.name.toLowerCase()}`} className={`block relative rounded-3xl overflow-hidden aspect-[3/4] bg-gradient-to-br ${category.gradient} group shadow-xl ring-1 ring-white/10 p-8 flex flex-col justify-end transition-transform hover:-translate-y-2 duration-500`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold tracking-widest text-white/60 mb-2 uppercase">
                    {category.count} Verified Artists
                  </p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">{category.name}</h3>
                </div>
                <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                   <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-secondary/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="text-center mb-20"
          >
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-accent mb-4">The Standard</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">Zero Friction.</p>
          </motion.div>

          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {processSteps.map((step, index) => (
              <motion.div variants={fadeIn} key={step.title} className="bg-background rounded-[2rem] p-10 border border-border mt-4 md:mt-0 relative group">
                <div className="absolute -top-8 left-10 w-16 h-16 rounded-2xl bg-foreground text-background shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 z-10">
                  <step.icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <div className="pt-8">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4 block">Step 0{index + 1}</span>
                  <h3 className="text-2xl font-black tracking-tight mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Safe Split CTA (Using reliable dark gradients instead of external images) */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-24 text-center text-white min-h-[50vh] bg-zinc-950 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
          <div className="relative z-20 space-y-8 max-w-md">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">For Clients</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Hire a Visionary.</h2>
            <p className="text-lg text-white/70 font-medium">Commission world-class talent for your next defining campaign or life event.</p>
            <Button size="lg" className="rounded-full h-14 px-10 text-base font-bold bg-white text-black hover:bg-white/90">
              <Link href="/search">Find a Photographer</Link>
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-24 text-center text-white min-h-[50vh] bg-[#0A0A0A] group border-t md:border-t-0 md:border-l border-white/5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
          <div className="relative z-20 space-y-8 max-w-md">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">For Artists</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Join the Collective.</h2>
            <p className="text-lg text-white/70 font-medium">Showcase your portfolio to high-end clients and manage your entire business seamlessly.</p>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-base font-bold border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/signup?role=photographer">Apply as Talent</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-border/40 py-16 px-6 bg-background">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-foreground" />
            <span className="text-xl font-black tracking-tight uppercase">LensConnect</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/search" className="hover:text-foreground transition-colors">Directory</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
