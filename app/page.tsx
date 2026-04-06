"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
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
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden bg-[#050505]">
        {/* Cinematic Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent opacity-50" />
        </div>
        
        {/* Cinematic Particles / Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150 mix-blend-overlay z-0 pointer-events-none" />
        
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
                <input 
                  type="text" 
                  placeholder="Location, City" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" 
                />
              </div>
            </div>
            <div className="flex-1 flex items-center px-4 md:px-6 py-4 border-b md:border-b-0 md:border-r border-border/50">
              <Calendar className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
               <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">When</span>
                <input 
                  type="text" 
                  placeholder="Select Dates" 
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" 
                />
              </div>
            </div>
            <div className="flex-1 flex items-center px-4 md:px-6 py-4">
              <ImageIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
               <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">What</span>
                <input 
                  type="text" 
                  placeholder="Editorial, Wedding..." 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground w-full text-base md:text-lg font-medium placeholder:text-muted-foreground" 
                />
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => {
                const params = new URLSearchParams();
                if (searchLocation) params.append("location", searchLocation);
                if (searchCategory) params.append("category", searchCategory);
                router.push(`/photographers?${params.toString()}`);
              }}
              className="h-auto py-4 md:py-0 md:w-32 rounded-xl md:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shrink-0 mx-2 mb-2 md:my-2 md:mx-2 font-bold text-base shadow-lg"
            >
              Search
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Categories */}
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
              <Link href={`/search?category=${category.name.toLowerCase()}`} className="block relative rounded-3xl overflow-hidden aspect-[3/4] bg-zinc-900 group shadow-xl ring-1 ring-white/10 p-8 flex flex-col justify-end transition-transform hover:-translate-y-2 duration-500">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                  style={{ backgroundImage: `url('${category.image}')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/80 transition-colors duration-500" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold tracking-widest text-white/80 mb-2 uppercase drop-shadow-md">
                    {category.count} Verified Artists
                  </p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-lg">{category.name}</h3>
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

      {/* Featured Creators Section */}
      <section className="py-24 bg-background border-b border-border/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
           <div>
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-accent mb-4">Elite Talent</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tight">Featured Artists.</p>
           </div>
           <Button asChild variant="link" className="text-accent font-bold p-0">
             <Link href="/photographers" className="flex items-center gap-2">
               Discover more talent <ArrowRight className="w-4 h-4" />
             </Link>
           </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCreators.map((creator, i) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 shadow-2xl">
                   <img 
                    src={creator.image} 
                    alt={creator.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-2">{creator.specialty}</p>
                    <h3 className="text-2xl font-black mb-2">{creator.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                      </div>
                      <span className="text-xs font-bold">{creator.rating}</span>
                      <span className="text-xs text-white/50">({creator.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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

      {/* Testimonials Section */}
      <section className="py-32 bg-background border-b border-border/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
             className="text-center mb-20"
          >
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-accent mb-4">Success Stories</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">The community speaks.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-secondary/20 p-8 rounded-[2rem] border border-border/50 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-lg font-medium leading-relaxed italic">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{t.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe Split CTA */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-24 text-center text-white min-h-[50vh] bg-zinc-950 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
          <div className="relative z-20 space-y-8 max-w-md">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">For Clients</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              {user?.role === 'client' ? "Your Next Project." : "Hire a Visionary."}
            </h2>
            <p className="text-lg text-white/70 font-medium">
              {user?.role === 'client' 
                ? "Post a new job and find the perfect visual storyteller for your campaign." 
                : "Commission world-class talent for your next defining campaign or life event."}
            </p>
            <Button size="lg" className="rounded-full h-14 px-10 text-base font-bold bg-white text-black hover:bg-white/90">
              <Link href={user?.role === 'client' ? "/dashboard/client/post-job" : "/photographers"}>
                {user?.role === 'client' ? "Post a Job" : "Find a Photographer"}
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-24 text-center text-white min-h-[50vh] bg-[#0A0A0A] group border-t md:border-t-0 md:border-l border-white/5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
          <div className="relative z-20 space-y-8 max-w-md">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">For Artists</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              {user?.role === 'photographer' ? "Your Portfolio." : "Join the Collective."}
            </h2>
            <p className="text-lg text-white/70 font-medium">
              {user?.role === 'photographer'
                ? "Manage your bookings, upload new work, and grow your creative business."
                : "Showcase your portfolio to high-end clients and manage your entire business seamlessly."}
            </p>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-base font-bold border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href={user?.role === 'photographer' ? "/dashboard" : "/signup?role=photographer"}>
                {user?.role === 'photographer' ? "Go to Dashboard" : "Apply as Talent"}
              </Link>
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
