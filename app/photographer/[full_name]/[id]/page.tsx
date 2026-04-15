"use client"

import { notFound } from "next/navigation"
import React, { useState, useEffect, use } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Calendar, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  profile_image_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  experience?: number;
  hourly_rate?: number;
  specialties?: string[];
  availability: boolean;
  rating?: number;
  review_count?: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string[];
  image_url: string[];
}

interface FormData {
  booking_date: string;
  booking_time: string;
  duration: string;
  shoot_type: string;
  location: string;
  message: string;
}

interface formErrors {
  booking_date?: string;
  booking_time?: string;
  duration?: string;
  shoot_type?: string;
  location?: string;
  message?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_id: string;
  profiles?: {
    full_name: string;
    profile_image_url: string;
  };
}

export default function PhotographerProfilePage({ params }: { params: Promise<{ full_name: string, id: string }> }) {
  const { id } = use(params)

  const [formErrors, setFormErrors] = useState<formErrors>({})

  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [photographerReviews, setPhotographerReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState<FormData>({
    booking_date: "",
    booking_time: "",
    duration: "1",
    shoot_type: "",
    location: "",
    message: ""
  })

  const validateForm = (): formErrors => {
    const errors: formErrors = {}
    if (!formData.booking_date) errors.booking_date = "Booking date is required"
    if (!formData.booking_time) errors.booking_time = "Booking time is required"
    if (!formData.duration) errors.duration = "Duration is required"
    if (!formData.shoot_type) errors.shoot_type = "Shoot type is required"
    if (!formData.location) errors.location = "Location is required"
    if (!formData.message) errors.message = "Message is required"
    return errors
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch photographer profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single()

        if (profileError || !profileData) {
          setError(true)
          return
        }

        // Fetch photographer portfolio
        const { data: portfolioData } = await supabase
          .from("photographer_portfolio")
          .select("*")
          .eq("photographer_id", id)

        if (portfolioData) {
          setPortfolioItems(portfolioData)
        }

        // Fetch photographer reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, profiles:client_id(full_name, profile_image_url)")
          .eq("photographer_id", id)
          .order("created_at", { ascending: false })

        if (reviewsData) {
          setPhotographerReviews(reviewsData)
          const count = reviewsData.length
          const avgRating = count > 0
            ? reviewsData.reduce((acc, rev) => acc + rev.rating, 0) / count
            : 5.0
          setProfile({ ...profileData, rating: avgRating, review_count: count })
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validateFormErrors = validateForm();
    setFormErrors(validateFormErrors);

    if (Object.keys(validateFormErrors).length > 0 || !profile) {
      if (!profile) toast.error("Profile data not loaded")
      setIsSubmitting(false)
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      toast.error("You must be logged in to book.")
      setIsSubmitting(false)
      return
    }

    try {
      const startTime = new Date(`${formData.booking_date}T${formData.booking_time}`).toISOString();
      const durationHours = parseFloat(formData.duration);
      const totalPrice = (profile.hourly_rate || 0) * durationHours;

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          photographer_id: id,
          client_id: userData.user.id,
          start_time: startTime,
          duration_hours: durationHours,
          shoot_type: formData.shoot_type,
          location: formData.location,
          total_price: totalPrice,
          message: formData.message
        })

      if (!bookingError) {
        toast.success("Booking request sent successfully!")
        setIsBookingOpen(false)
        setFormData({ booking_date: "", booking_time: "", duration: "1", shoot_type: "", location: "", message: "" })
      } else {
        toast.error("Failed to send booking request.", { description: bookingError.message })
      }
    } catch (err) {
      console.error("Error submitting booking:", err)
      toast.error("Failed to send booking request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !profile) return notFound()

  // Grab the first portfolio image for the cinematic header cover, if available
  const coverImage = portfolioItems[0]?.image_url?.[0] || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2668&auto=format&fit=crop"

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <div className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-xl border-b border-border/10">
        <Header />
      </div>

      {/* Cinematic Cover Header */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] group overflow-hidden bg-muted">
        <img 
          src={coverImage} 
          alt="Cover" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6] scale-100 transition-transform duration-1000 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Floating Avatar and Hero Info */}
        <div className="absolute bottom-0 left-0 w-full translate-y-1/3">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-background shadow-2xl relative z-20">
              <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} className="object-cover" />
              <AvatarFallback className="text-4xl bg-secondary">{profile.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="pb-8 md:pb-16 relative z-20 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 text-foreground break-words">{profile.full_name}</h1>
              <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground font-medium text-lg">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location || "Worldwide"}</span>
                <span className="hidden md:inline text-border">•</span>
                <span className="flex items-center gap-1.5 text-accent"><Star className="w-4 h-4 fill-accent" />{profile.rating?.toFixed(1)} ({profile.review_count} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-24 md:py-32 max-w-7xl pt-40 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Content Pane */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Biography & Meta tags */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.specialties?.map((s) => (
                  <Badge key={s} variant="secondary" className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-secondary text-foreground">
                    {s}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight">The Artist</h2>
              <p className="text-lg text-muted-foreground leading-relaxed md:leading-loose">
                {profile.bio || "This artist prefers to let their work speak for itself."}
              </p>
            </motion.section>

            {/* Edge-to-Edge Masonry Portfolio */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight">Selected Works</h2>
              {portfolioItems.length > 0 ? (
                <div className="columns-1 md:columns-2 gap-4 space-y-4">
                  {portfolioItems.flatMap(item => item.image_url).map((image, index) => (
                    <div key={index} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-muted">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Portfolio piece ${index + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center rounded-3xl bg-secondary/30 border border-border/50">
                  <p className="text-muted-foreground">Portfolio is currently being curated.</p>
                </div>
              )}
            </motion.section>

            {/* Minimalist Reviews */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight">Client Perspectives</h2>
              {photographerReviews.length > 0 ? (
                <div className="space-y-6">
                  {photographerReviews.map((review) => (
                    <div key={review.id} className="p-8 rounded-3xl bg-secondary/10 border border-border/40 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-foreground text-foreground" : "text-muted"}`} />
                        ))}
                      </div>
                      <p className="text-lg font-medium leading-relaxed">"{review.comment}"</p>
                      <div className="flex items-center gap-3 pt-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.profiles?.profile_image_url} className="object-cover" />
                          <AvatarFallback className="text-xs bg-muted">{review.profiles?.full_name?.charAt(0)||'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{review.profiles?.full_name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest ml-auto">
                          {new Date(review.created_at).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center rounded-3xl bg-secondary/10 border border-dashed border-border/50">
                  <p className="text-muted-foreground">No perspectives shared yet.</p>
                </div>
              )}
            </motion.section>

          </div>

          {/* Sticky Actions Pane */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 space-y-6">
              <div className="p-8 lg:p-10 rounded-[2rem] bg-secondary/40 border border-border/50 backdrop-blur-3xl shadow-2xl">
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold tracking-tight">₦{profile.hourly_rate || 0}</span>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">/ Hour</span>
                  </div>
                  {profile.availability ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> <span>Accepting specific commissions</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>Books currently closed</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full h-14 rounded-full text-base font-semibold shadow-xl" 
                    disabled={!profile.availability} 
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Request Booking
                  </Button>
                  <Button variant="outline" className="w-full h-14 rounded-full text-base font-semibold bg-transparent" asChild>
                    <Link href={`/messages?to=${profile.id}`}>Inquire via Message</Link>
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Standard Deliverables</h4>
                  <ul className="space-y-3 text-sm font-medium">
                    {['Commercial usage rights', 'High-res retouched files', 'Private online gallery', 'Pre-shoot consultation'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Dialog Form */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background text-foreground border-border p-0 overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="p-8 md:p-10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold tracking-tight">Commission Request</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Submit project details for evaluation by <span className="font-semibold">{profile.full_name}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="booking_date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</Label>
                  <Input id="booking_date" name="booking_date" type="date" required value={formData.booking_date} onChange={handleInputChange} className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-accent" />
                  {formErrors.booking_date && <p className="text-xs text-destructive mt-1">{formErrors.booking_date}</p>}
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="booking_time" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</Label>
                  <Input id="booking_time" name="booking_time" type="time" required value={formData.booking_time} onChange={handleInputChange} className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-accent" />
                  {formErrors.booking_time && <p className="text-xs text-destructive mt-1">{formErrors.booking_time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration</Label>
                  <Select value={formData.duration} onValueChange={(val) => handleSelectChange('duration', val)}>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent focus:ring-accent">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(h => (
                        <SelectItem key={h} value={h.toString()} className="rounded-lg">{h} {h === 1 ? 'Hour' : 'Hours'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="shoot_type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Style</Label>
                  <Select value={formData.shoot_type} onValueChange={(val) => handleSelectChange('shoot_type', val)}>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent focus:ring-accent">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {profile.specialties?.map(s => (
                        <SelectItem key={s} value={s.toLowerCase()} className="rounded-lg">{s}</SelectItem>
                      )) || ["Portrait", "Editorial"].map(s => (
                        <SelectItem key={s} value={s.toLowerCase()} className="rounded-lg">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="location" name="location" placeholder="Shoot location or studio" required value={formData.location} onChange={handleInputChange} className="pl-11 h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-accent" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Brief</Label>
                <span className="text-[10px] text-muted-foreground">(Optional)</span>
                <Textarea id="message" name="message" placeholder="Describe the creative direction and deliverables..." value={formData.message} onChange={handleInputChange} className="min-h-[120px] rounded-xl bg-secondary/50 border-transparent focus-visible:ring-accent resize-none p-4" />
              </div>

              <Button type="submit" className="w-full h-14 text-base font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all mt-4" disabled={isSubmitting}>
                {isSubmitting ? ( <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Transmitting...</> ) : ( "Submit Commission Request" )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
