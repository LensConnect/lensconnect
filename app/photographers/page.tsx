"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, SlidersHorizontal, Loader2, MapPin, Star } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"

const specialties = ["Events", "Portraits", "Products", "Real Estate", "Fashion", "Family", "Weddings", "Commercial"]

interface Photographers {
  id: string;
  profile_image_url: string;
  location: string;
  hourly_rate: number;
  specialties: string[];
  bio: string;
  full_name: string;
  rating: number;
  review_count: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [minRating, setMinRating] = useState("0")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(true)

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  const [loading, setLoading] = useState(true)
  const [photographers, setPhotographers] = useState<Photographers[]>([])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "photographer")

      if (error) {
        console.error("Error fetching photographers:", error)
        return
      }

      if (data) {
        const mappedPhotographers = data.map((profile) => ({
          id: profile.id,
          profile_image_url: profile.profile_image_url,
          location: profile.location || "",
          hourly_rate: profile.hourly_rate || 0,
          specialties: profile.specialties || [],
          bio: profile.bio || "",
          full_name: profile.full_name || "Unknown Photographer",
          rating: profile.rating || 5.0,
          review_count: profile.review_count || 0,
        }))
        setPhotographers(mappedPhotographers)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const filteredPhotographers = useMemo(() => {
    const filtered = photographers.filter((photographer) => {
      if (searchQuery && !photographer.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (location && !photographer.location.toLowerCase().includes(location.toLowerCase())) return false
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = photographer.specialties.some((s) => selectedSpecialties.includes(s))
        if (!hasMatchingSpecialty) return false
      }
      if (photographer.hourly_rate < priceRange[0] || photographer.hourly_rate > priceRange[1]) return false
      if (photographer.rating < Number.parseFloat(minRating)) return false
      return true
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating
        case "price-low": return a.hourly_rate - b.hourly_rate
        case "price-high": return b.hourly_rate - a.hourly_rate
        case "reviews": return b.review_count - a.review_count
        default: return 0
      }
    })

    return filtered
  }, [photographers, searchQuery, location, selectedSpecialties, priceRange, minRating, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1440px]">
        {/* Cinematic Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Discover Talent</h1>
            <p className="text-lg text-muted-foreground font-normal">Find the perfect lens for your next editorial or event.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden rounded-full h-12 px-6"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Minimalist Sidebar Filters */}
          <AnimatePresence>
            {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
              <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${showFilters ? "block" : "hidden"} lg:block lg:col-span-1 space-y-10`}
              >
                <div className="space-y-8 sticky top-32">
                  <div className="space-y-3">
                    <Label htmlFor="search" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Photographer</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search names..."
                        className="pl-10 h-12 bg-secondary/50 border-none rounded-xl focus-visible:ring-accent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g. New York"
                        className="pl-10 h-12 bg-secondary/50 border-none rounded-xl focus-visible:ring-accent"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Specialties</Label>
                    <div className="flex flex-col gap-3">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                            className="rounded data-[state=checked]:bg-foreground data-[state=checked]:border-foreground transition-all"
                          />
                          <label
                            htmlFor={`specialty-${specialty}`}
                            className="text-sm font-medium leading-none cursor-pointer group-hover:text-foreground text-muted-foreground transition-colors"
                          >
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Price ($/hr)</Label>
                      <span className="text-sm font-medium text-foreground">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_[role=slider]]:w-5 [&_[role=slider]]:h-5"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground rounded-full h-12"
                    onClick={() => {
                      setSearchQuery("")
                      setLocation("")
                      setSelectedSpecialties([])
                      setPriceRange([0, 1000])
                      setMinRating("0")
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm font-medium text-balance">
                Showing <span className="font-semibold text-foreground">{filteredPhotographers.length}</span> artists matching criteria
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground shrink-0">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10 bg-secondary/30 border-none rounded-xl font-medium focus:ring-accent">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="rating" className="rounded-lg">Highest Rating</SelectItem>
                    <SelectItem value="reviews" className="rounded-lg">Most Reviews</SelectItem>
                    <SelectItem value="price-low" className="rounded-lg">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="rounded-lg">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground animate-pulse font-medium">Curating artists...</p>
              </div>
            ) : filteredPhotographers.length > 0 ? (
              /* MASONRY GRID LAYOUT */
              <div className="columns-1 sm:columns-2 gap-6 space-y-6 pt-4">
                {filteredPhotographers.map((photographer) => (
                  <Link
                    key={photographer.id}
                    href={`/photographer/${photographer.id}`}
                    className="group block break-inside-avoid"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-secondary/20 hover:bg-secondary/40 transition-colors duration-500 border border-border/40">
                      {/* Cinema-style Image Mask */}
                      <div className="relative w-full aspect-[4/5] overflow-hidden">
                        {photographer.profile_image_url ? (
                          <Image
                            src={photographer.profile_image_url}
                            alt={photographer.full_name}
                            fill
                            className="object-cover group-hover:scale-[1.03] origin-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/80">
                            <span className="text-8xl font-light text-muted opacity-30">
                              {photographer.full_name?.charAt(0) || "P"}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Hover action */}
                        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20 flex justify-between items-end">
                           <span className="text-white font-medium shadow-sm">View Portfolio</span>
                           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                             <Search className="w-4 h-4" />
                           </div>
                        </div>
                      </div>

                      {/* Content Pane */}
                      <div className="p-6 relative z-10 bg-background/5 backdrop-blur-sm group-hover:bg-transparent transition-colors duration-500">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold tracking-tight group-hover:text-accent transition-colors">
                              {photographer.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                              <MapPin className="w-3.5 h-3.5" />
                              {photographer.location || "Worldwide"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xl font-bold tracking-tight">${photographer.hourly_rate}</span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">/hour</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mb-5 font-medium">
                          <Star className="h-4 w-4 fill-foreground text-foreground" />
                          <span>{photographer.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm ml-1">· {photographer.review_count} reviews</span>
                        </div>

                        {photographer.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {photographer.specialties.slice(0, 3).map((specialty, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-foreground/5 text-foreground text-xs font-semibold tracking-wide rounded-full border border-foreground/10"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 rounded-3xl border border-dashed border-border/80 bg-secondary/10">
                <p className="text-muted-foreground text-lg">No artists match your exact vision.</p>
                <Button variant="outline" className="rounded-full h-12 px-8" onClick={() => {
                  setSearchQuery("")
                  setLocation("")
                  setSelectedSpecialties([])
                  setPriceRange([0, 1000])
                  setMinRating("0")
                }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
