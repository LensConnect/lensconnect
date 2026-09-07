"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Search,
  SlidersHorizontal,
  Loader2,
  MapPin,
  Star,
  Sparkles,
  Camera,
  DollarSign,
  X,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { PhotographerProfile } from "@/lib/types";

const specialties = [
  "Events",
  "Portraits",
  "Products",
  "Real Estate",
  "Fashion",
  "Family",
  "Weddings",
  "Commercial",
  "Sports",
  "Editorial",
  "Studio",
  "Architecture",
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(true);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>([]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get_photographer_profiles", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching photographers:", data.error);
        return;
      }

      if (data) {
        const mappedPhotographers = data.map((profile: any) => ({
          id: profile.id,
          userId: profile.userId,
          profile_image_url: profile.profile_image_url,
          location: profile.location || "",
          hourlyRate: profile.hourlyRate || 0,
          specialties: profile.specialties || [],
          bio: profile.bio || "",
          fullname: profile.fullname || "Unknown Photographer",
          rating: profile.rating || 0,
          reviewCount: profile.reviewCount || 0,
          portfolioImages: profile.portfolio_image_url || [],
          availability: profile.availability ?? true,
        }));
        setPhotographers(mappedPhotographers);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const filteredPhotographers = useMemo(() => {
    const filtered = photographers.filter((photographer) => {
      if (searchQuery && !photographer.fullname.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (location && !photographer.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = photographer.specialties.some((s) => selectedSpecialties.includes(s));
        if (!hasMatchingSpecialty) return false;
      }
      if (photographer.hourlyRate < priceRange[0] || photographer.hourlyRate > priceRange[1]) return false;
      if ((photographer.rating || 0) < Number.parseFloat(minRating)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "price-low":
          return a.hourlyRate - b.hourlyRate;
        case "price-high":
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [photographers, searchQuery, location, selectedSpecialties, priceRange, minRating, sortBy]);

  const search = async (customPrompt?: string) => {
    const queryToSearch = customPrompt ?? naturalLanguageInput ?? searchQuery;
    if (!queryToSearch?.trim()) return;

    try {
      setAiSearching(true);
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userNaturalLanguagePrompt: queryToSearch }),
      });

      if (!response.ok) {
        console.error("Error executing natural search");
      }

      const data = await response.json();

      if (data.success && data.filters) {
        setSearchQuery(data.filters.searchQuery || "");
        setLocation(data.filters.location || "");
        setSelectedSpecialties(data.filters.selectedSpecialties || []);
        setMinRating(data.filters.minRating?.toString() || "0");

        if (data.filters.maxPrice) {
          setPriceRange([data.filters.minPrice || 0, data.filters.maxPrice]);
        }

        if (data.filters.sortBy) {
          setSortBy(data.filters.sortBy);
        }
      }
    } catch (err) {
      console.error("Error trying to search the language:", err);
    } finally {
      setAiSearching(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setLocation("");
    setSelectedSpecialties([]);
    setPriceRange([0, 5000]);
    setMinRating("0");
    setNaturalLanguageInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      {/* Hero Header Search */}
      <section className="border-b border-border/80 bg-card py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground">
                <Camera className="h-3 w-3 text-primary" />
                Talent Directory
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Curated Visual Artists</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Discover Top Photographers
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with verified portrait, commercial, wedding, and event photographers ready for commission.
            </p>
          </div>

          {/* Natural Language / AI Search Input */}
          <div className="rounded-2xl border border-border/80 bg-background p-2 sm:p-2.5 shadow-sm max-w-4xl space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Describe what you need (e.g. Wedding photographer in Lagos under ₦300k)..."
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="pl-10 h-11 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                />
              </div>

              <Button
                onClick={() => search()}
                disabled={aiSearching}
                className="h-10 px-5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0 shadow-xs"
              >
                {aiSearching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Smart Search</span>
                  </>
                )}
              </Button>
            </div>

            {/* Suggested Search Prompts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 px-1 text-[11px] text-muted-foreground">
              <span className="font-semibold">Try:</span>
              {[
                "Wedding photographers in Lagos",
                "Studio portraits under $200/hr",
                "Fashion & editorial creators",
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setNaturalLanguageInput(example);
                    search(example);
                  }}
                  className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground/80 transition-colors border border-border/40 font-medium"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Filters
                  </span>
                </div>
                {(searchQuery || location || selectedSpecialties.length > 0 || priceRange[1] < 5000) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Name Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs font-semibold text-foreground">
                  Photographer Name
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    className="pl-9 h-9 rounded-xl bg-background border-border/80 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g. New York, London..."
                    className="pl-9 h-9 rounded-xl bg-background border-border/80 text-xs"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Specialties Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Specialties</Label>
                  {selectedSpecialties.length > 0 && (
                    <span className="text-[10px] text-primary font-bold">{selectedSpecialties.length} active</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {specialties.map((specialty) => {
                    const isSelected = selectedSpecialties.includes(specialty);
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                            : "bg-background text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {specialty}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-semibold text-foreground">Max Hourly Rate</Label>
                  <span className="font-mono font-bold text-primary">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={25}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
              </div>
            </div>
          </aside>

          {/* Results Grid Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Results Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing <strong className="text-foreground font-bold">{filteredPhotographers.length}</strong> verified artists
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium shrink-0">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[170px] h-9 bg-card border-border/80 rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="rating" className="text-xs">Highest Rating</SelectItem>
                    <SelectItem value="price-low" className="text-xs">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="text-xs">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photographers Grid */}
            {loading ? (
              <div className="py-24 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Curating photography talent...</p>
              </div>
            ) : filteredPhotographers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredPhotographers.map((photographer, idx) => (
                  <Link
                    key={photographer.id || idx}
                    href={`/photographer/${encodeURIComponent(photographer.fullname)}/${photographer.id}`}
                    className="group block rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Portrait Cover Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {photographer.profile_image_url ? (
                          <img
                            src={photographer.profile_image_url}
                            alt={photographer.fullname}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <span className="text-4xl font-bold opacity-30">
                              {photographer.fullname?.charAt(0) || "P"}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                        <div className="absolute top-3 right-3">
                          <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/60 font-mono font-bold text-xs shadow-xs">
                            ${photographer.hourlyRate}/hr
                          </Badge>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-base font-bold truncate group-hover:text-primary-foreground transition-colors flex items-center gap-1.5">
                            <span>{photographer.fullname}</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          </h3>
                          {photographer.location && (
                            <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {photographer.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Details & Tags */}
                      <div className="p-4 space-y-3">
                        {photographer.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {photographer.bio}
                          </p>
                        )}

                        {photographer.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {photographer.specialties.slice(0, 3).map((spec) => (
                              <span
                                key={spec}
                                className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80"
                              >
                                {spec}
                              </span>
                            ))}
                            {photographer.specialties.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                                +{photographer.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-border/40 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>View Creator Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No Photographers Match Criteria</h3>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your filters, location, or search keywords to find creators.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetFilters}
                  className="rounded-xl text-xs font-bold mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
