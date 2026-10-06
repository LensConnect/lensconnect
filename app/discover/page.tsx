"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Search,
  SlidersHorizontal,
  Loader2,
  MapPin,
  Star,
  Camera,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface DatasetPhotographer {
  id: string;
  title: string;
  location: string;
  reviewsCount: number;
  rating: number;
  specialties: string[];
  website: string;
  phone: string;
  street: string;
}

const specialtiesList = [
  "Photographer",
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
  "Lifestyle",
];

const normalizeSpecialty = (specialty: string) => specialty.trim().toLowerCase().replace(/s$/, "");

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [photographers, setPhotographers] = useState<DatasetPhotographer[]>([]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get_photographer_datasets", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching photographers:", data.error);
        return;
      }

      if (Array.isArray(data)) {
        setPhotographers(data);
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
      if (searchQuery && !photographer.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (location && !photographer.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = photographer.specialties.some((photographerSpecialty) =>
          selectedSpecialties.some((selectedSpecialty) =>
            normalizeSpecialty(selectedSpecialty) === normalizeSpecialty(photographerSpecialty)
          )
        );
        if (!hasMatchingSpecialty) return false;
      }
      if ((photographer.rating || 0) < Number.parseFloat(minRating)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [photographers, searchQuery, location, selectedSpecialties, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setLocation("");
    setSelectedSpecialties([]);
    setMinRating("0");
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
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

          {/* Search Input */}
          <div id="smart-search" className="rounded-2xl border border-border/80 bg-background p-2 sm:p-2.5 shadow-sm max-w-4xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photographers by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city, state, or country..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-11 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                />
              </div>
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
                {(searchQuery || location || selectedSpecialties.length > 0 || Number(minRating) > 0) && (
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

              {/* Location Input */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-foreground">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g. Lagos, Abuja..."
                    className="pl-9 h-9 rounded-xl bg-background border-border/80 text-xs"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Specialties Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Category</Label>
                  {selectedSpecialties.length > 0 && (
                    <span className="text-[10px] text-primary font-bold">{selectedSpecialties.length} active</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {specialtiesList.map((specialty) => {
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

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-semibold text-foreground">Minimum Rating</Label>
                  <span className="font-mono font-bold text-primary">
                    {minRating === "0" ? "Any" : `${minRating} ★`}
                  </span>
                </div>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full h-9 bg-background border-border/80 rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="0" className="text-xs">Any rating</SelectItem>
                    <SelectItem value="1" className="text-xs">1 ★ & up</SelectItem>
                    <SelectItem value="2" className="text-xs">2 ★ & up</SelectItem>
                    <SelectItem value="3" className="text-xs">3 ★ & up</SelectItem>
                    <SelectItem value="4" className="text-xs">4 ★ & up</SelectItem>
                    <SelectItem value="4.5" className="text-xs">4.5 ★ & up</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="name" className="text-xs">Name (A-Z)</SelectItem>
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
                  <div
                    key={photographer.id || idx}
                    className="group block rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Portrait Cover Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <span className="text-6xl font-bold opacity-30">
                            {photographer.title?.charAt(0) || "P"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-base font-bold truncate group-hover:text-primary-foreground transition-colors flex items-center gap-1.5">
                            <span>{photographer.title}</span>
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
                        {photographer.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="font-semibold text-foreground/70">Phone:</span>
                            {photographer.phone}
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

                    <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-border/40 text-xs font-semibold text-primary">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {photographer.rating > 0 ? photographer.rating.toFixed(1) : "New"} ({photographer.reviewsCount})
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
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