'use client';
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  Calendar,
  MessageSquare,
  Star,
  Camera,
  Users,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleContentRole = async () => {
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !authUser) return;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile', profileError);
      return;
    }

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

  // Dynamic content based on role
  const heroTitle =
    user?.role === "photographer"
      ? "Turn Your Talent Into Opportunity"
      : user?.role === "client"
      ? "Find Elite Photographers Worldwide"
      : "Where Vision Meets Talent";

  const heroSubtitle =
    user?.role === "photographer"
      ? "Showcase your portfolio, connect with clients, and grow your career."
      : user?.role === "client"
      ? "Hire world-class photographers for your next big project."
      : "Connect talented photographers with clients around the globe.";

  const heroCtaButtons =
    user?.role === "photographer" ? (
      <>
        <Button size="xl" asChild className="text-lg px-12 rounded-full hover:scale-105 transition-transform">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button size="xl" variant="outline" asChild className="text-lg px-12 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all">
          <Link href="/portfolio">Manage Portfolio</Link>
        </Button>
      </>
    ) : user?.role === "client" ? (
      <>
        <Button size="xl" asChild className="text-lg px-12 rounded-full hover:scale-105 transition-transform">
          <Link href="/search">Find Photographers</Link>
        </Button>
        <Button size="xl" variant="outline" asChild className="text-lg px-12 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all">
          <Link href="/post-job">Post a Job</Link>
        </Button>
      </>
    ) : (
      <>
        <Button size="xl" asChild className="text-lg px-12 rounded-full hover:scale-105 transition-transform">
          <Link href="/search">Explore Artists</Link>
        </Button>
        <Button size="xl" variant="outline" asChild className="text-lg px-12 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all">
          <Link href="/signup">Join LensConnect</Link>
        </Button>
      </>
    );

  // Featured categories (same for everyone, can customize per role if needed)
  const categories = [
    { name: "Events", image: "/wedding-event-photography.png", count: "1,234" },
    { name: "Portraits", image: "/professional-portrait.png", count: "892" },
    { name: "Products", image: "/product-photography-studio.png", count: "567" },
    { name: "Real Estate", image: "/real-estate-interior-photography.jpg", count: "423" },
  ];

  // How it works steps
  const processSteps =
    user?.role === "photographer"
      ? [
          { icon: Search, title: "DISCOVER CLIENTS", description: "Find clients that match your style and skillset." },
          { icon: Calendar, title: "SCHEDULE", description: "Manage your bookings efficiently from your dashboard." },
          { icon: MessageSquare, title: "COLLABORATE", description: "Discuss project details directly with clients." },
          { icon: Star, title: "DELIVER", description: "Submit your work and get paid securely." },
        ]
      : [
          { icon: Search, title: "DISCOVER", description: "Search our elite roster by style, specialty, and location." },
          { icon: Calendar, title: "RESERVE", description: "Secure your date with our streamlined booking system." },
          { icon: MessageSquare, title: "COLLABORATE", description: "Direct access to discuss your creative vision." },
          { icon: Star, title: "DELIVER", description: "Receive world-class imagery protected by our guarantee." },
        ];

  // Features / Why choose us
  const features = [
    { icon: Camera, title: "Verified Excellence", description: "Only the top 5% of applicants are accepted into our collective." },
    { icon: Shield, title: "Secured Escrow", description: "Peace of mind with payments held securely until delivery." },
    { icon: Users, title: "Global Network", description: "Access to a diverse community of visual storytellers." },
    { icon: Star, title: "Premium Support", description: "Dedicated production concierge for every booking." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-24 md:py-32 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)/15,transparent_50%),radial-gradient(circle_at_bottom_left,var(--accent)/10,transparent_50%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="container mx-auto max-w-6xl relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4 animate-fade-in">
            <Camera className="w-3 h-3" />
            <span>{user?.role === 'photographer' ? 'Top Photographers' : 'Top Clients'}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-balance leading-[0.9] md:leading-[0.9]">
            {heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            {heroCtaButtons}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 bg-secondary/30 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                Curated Specialties
              </h2>
              <p className="text-3xl md:text-4xl font-bold">Popular Categories</p>
            </div>
            <Link href="/search" className="text-primary hover:underline underline-offset-4 text-sm font-medium">
              View all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?category=${category.name.toLowerCase()}`}
                className="group relative h-[450px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl transition-all hover:-translate-y-2"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="text-xs font-bold tracking-widest text-primary/80 mb-2 uppercase">
                    {category.count} Photographers
                  </p>
                  <h3 className="text-3xl font-bold text-white mb-4">{category.name}</h3>
                  <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-primary">The Process</h2>
            <p className="text-4xl md:text-5xl font-black">HOW IT WORKS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {processSteps.map((step) => (
              <div key={step.title} className="group text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500 transform group-hover:rotate-6">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-4 bg-secondary/30 relative border-y border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-primary">Why Join Us</h2>
              <p className="text-4xl font-black leading-tight">The LensConnect <br />Difference</p>
              <p className="text-muted-foreground font-light leading-relaxed">
                {user?.role === 'photographer'
                  ? "Grow your photography career while connecting with clients worldwide."
                  : "Hire and collaborate with top-tier photographers for your projects."}
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/40 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all group p-4">
                  <CardContent className="pt-6 text-left space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10 space-y-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            READY TO START YOUR <br />
            <span className="text-primary italic">STORY?</span>
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            {user?.role === 'photographer'
              ? "Sign up now and start connecting with clients around the world."
              : "Find your next photographer today and make your vision come alive."}
          </p>
          <div className="pt-8">
            <Button size="2xl" asChild className="px-16 rounded-full hover:scale-105 transition-all shadow-[0_0_30px_-5px_var(--primary)]">
              <Link href="/search">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search">Find Photographers</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Photographers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/signup?role=photographer">Join as Photographer</Link></li>
              <li><Link href="/resources">Resources</Link></li>
              <li><Link href="/success-stories">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LensConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
