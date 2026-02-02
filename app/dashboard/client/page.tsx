"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Search, Camera, Star, MapPin, SlidersHorizontal, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Photographer {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  location: string;
  completed_jobs: number;
}

export default function ClientDashboard() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotographers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "photographer");

        if (error) throw error;

        // Map data if schema differs slightly, providing fallbacks
        const mappedData: Photographer[] = (data || []).map(p => ({
          id: p.id,
          name: p.full_name || p.username || "Anonymous Artist",
          specialty: p.specialty || "General Photography",
          avatar: p.avatar_url || "/placeholder.svg",
          rating: p.rating || 5.0,
          location: p.location || "Remote",
          completed_jobs: p.completed_jobs || 0,
        }));

        setPhotographers(mappedData);
      } catch (err) {
        console.error("Error fetching photographers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotographers();
  }, []);

  const filteredPhotographers = photographers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-12">
        {/* Dashboard Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <User className="w-3 h-3" />
              <span>Client Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              DISCOVER <span className="text-primary italic">TALENT</span>
            </h1>
            <p className="text-muted-foreground font-light max-w-md">
              Browse our world-class collective of photographers and book your next session today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by name or style..."
                className="pl-10 w-full md:w-[300px] bg-secondary/50 border-border/50 focus:border-primary/50 rounded-full h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-border/50 bg-secondary/50">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Photographers Gallery */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] rounded-2xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : filteredPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredPhotographers.map((photographer) => (
              <Link
                key={photographer.id}
                href={`/photographers/${photographer.id}`}
                className="group relative h-[450px] rounded-2xl overflow-hidden border border-border/50 bg-secondary/20 transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <img
                  src={photographer.avatar}
                  alt={photographer.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />

                {/* Meta Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{photographer.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">
                      {photographer.specialty}
                    </p>
                    <h3 className="text-2xl font-black text-white leading-none tracking-tight">
                      {photographer.name.split(' ')[0]} <br />
                      <span className="text-white/60">{photographer.name.split(' ').slice(1).join(' ')}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <MapPin className="h-3 w-3" />
                      <span>{photographer.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Camera className="h-3 w-3" />
                      <span>{photographer.completed_jobs} Jobs</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 space-y-6 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
            <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">No Artists Found</h3>
              <p className="text-muted-foreground text-sm font-light">
                We couldn't find any photographers matching "{searchQuery}".
              </p>
            </div>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear all filters
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 mt-24">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LensConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}