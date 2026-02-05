"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { PhotographerCard } from "@/components/photographer-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SlidersHorizontal, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import { PhotographerProfile, User } from "@/lib/types"
import Link from "next/link"

const specialties = ["Events", "Portraits", "Products", "Real Estate", "Fashion", "Family", "Weddings", "Commercial"]

interface Photographers {
  id: string;
  profile_image_url: string;
  location: string;
  hourly_rate: number;
  specialties: string[];
  bio: string;
  full_name: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
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
          location: profile.location,
          hourly_rate: profile.hourly_rate,
          specialties: profile.specialties,
          bio: profile.bio,
          full_name: profile.full_name,
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


  /* const filteredPhotographers = useMemo(() => {
    const filtered = photographers.filter((photographer) => {
      // Search query filter
      if (searchQuery && !photographer.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Location filter
      if (location && !photographer.location.toLowerCase().includes(location.toLowerCase())) {
        return false
      }

      // Specialty filter
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = photographer.specialties.some((s) => selectedSpecialties.includes(s))
        if (!hasMatchingSpecialty) return false
      }

      // Price range filter
      if (photographer.hourlyRate < priceRange[0] || photographer.hourlyRate > priceRange[1]) {
        return false
      }

      // Rating filter
      if (photographer.rating < Number.parseFloat(minRating)) {
        return false
      }

      return true
    })
 */
  // Sort
  /*   filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return a.hourlyRate - b.hourlyRate
        case "price-high":
          return b.hourlyRate - a.hourlyRate
        case "reviews":
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, location, selectedSpecialties, priceRange, minRating, sortBy]) */

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Photographer</h1>
          <p className="text-muted-foreground">Discover talented photographers for your next project</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : photographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((photographer) => (
              <Link
                key={photographer.id}
                href={`/photographer/${photographer.id}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  {/* Profile Image */}
                  <div className="relative h-64 overflow-hidden bg-muted">
                    {photographer.profile_image_url ? (
                      <Image
                        src={photographer.profile_image_url}
                        alt={photographer.full_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="text-6xl font-bold text-primary/30">
                          {photographer.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Name and Location */}
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {photographer.full_name || "Unknown Photographer"}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {photographer.location || "Location not specified"}
                      </p>
                    </div>

                    {/* Specialties */}
                    {photographer.specialties && photographer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {photographer.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {photographer.specialties.length > 3 && (
                          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                            +{photographer.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {photographer.bio || "No bio available"}
                    </p>

                    {/* Hourly Rate */}
                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ${photographer.hourly_rate || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">/hour</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        View Profile →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">No photographers found</p>
            <p className="text-sm text-muted-foreground">Check back later for new talent!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
