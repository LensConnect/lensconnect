"use client"

import { notFound } from "next/navigation"
import React, { useState, useEffect, use } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, DollarSign, X, Calendar, MessageSquare, CheckCircle2, Loader2, Clock, Camera as CameraIcon } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { constants } from "crypto"

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
  /*   photographer_id: string; */
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

export default function PhotographerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [formErrors, setFormErrors] = useState<formErrors>({})

  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
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

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateForm = (): formErrors => {
    const errors: formErrors = {}
    if (!formData.booking_date)
      errors.booking_date = "Booking date is required"

    if (!formData.booking_time)
      errors.booking_time = "Booking time is required"

    if (!formData.duration)
      errors.duration = "Duration is required"

    if (!formData.shoot_type)
      errors.shoot_type = "Shoot type is required"

    if (!formData.location)
      errors.location = "Location is required"

    if (!formData.message)
      errors.message = "Message is required"
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
        setProfile(profileData)

        // Fetch photographer portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from("photographer_portfolio")
          .select("*")
          .eq("photographer_id", id)

        if (portfolioData) {
          setPortfolioItems(portfolioData)
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
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validateFormErrors = validateForm();
    setFormErrors(validateFormErrors);

    if (Object.keys(validateFormErrors).length > 0 || !profile) {
      if (!profile) {
        toast.error("Profile data not loaded", {
          description: "Please refresh the page and try again.",
        })
      }
      setIsSubmitting(false)
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData) {
      toast.error("Failed to get user data.", {
        description: "Please try again later.",
      })
      return
    }

    try {
      // Combine date and time into an ISO string
      const startTime = new Date(`${formData.booking_date}T${formData.booking_time}`).toISOString();
      const durationHours = parseFloat(formData.duration);
      const totalPrice = (profile.hourly_rate || 0) * durationHours;

      const { data: bookingData, error: bookingError } = await supabase
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
        toast.success("Booking request sent successfully!", {
          description: "The photographer will be notified of your request.",
        })
      } else {
        toast.error("Failed to send booking request.", {
          description: "Please try again later.",
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1500)) // Mock delay

      toast.success("Booking request sent successfully!", {
        description: "The photographer will be notified of your request.",
      })
      setIsBookingOpen(false)
      setFormData({
        booking_date: "",
        booking_time: "",
        duration: "1",
        shoot_type: "",
        location: "",
        message: ""
      })
    } catch (err) {
      console.error("Error submitting booking:", err)
      toast.error("Failed to send booking request.", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    notFound()
    return null
  }

  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Photographer Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} alt={profile.full_name} className="object-cover" />
                    <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location || "Location not specified"}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties?.map((specialty: string) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{(profile.rating || 5.0).toFixed(1)}</span>
                        <span className="text-muted-foreground">({profile.review_count || 0} reviews)</span>
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <DollarSign className="h-5 w-5" />
                        <span>{profile.hourly_rate || 0}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">About</h2>
                <p className="text-muted-foreground leading-relaxed">{profile.bio || "No bio available."}</p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Portfolio</h2>
                {portfolioItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.flatMap(item => item.image_url).map((image, index) => (
                      <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No portfolio images uploaded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold">Reviews ({photographerReviews.length})</h2>
                {photographerReviews.length > 0 ? (
                  <div className="space-y-6">
                    {photographerReviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${profile.hourly_rate || 0}</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                  {profile.availability ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Available for booking</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Currently unavailable</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" size="lg" disabled={!profile.availability} onClick={() => setIsBookingOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg" asChild>
                    <Link href={`/messages?to=${profile.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                </div>

                {/* Improved Booking Modal */}
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogContent className="sm:max-w-[500px] bg-black text-white border-white/10 p-0 overflow-hidden rounded-2xl">
                    <div className="bg-gradient-to-br from-primary/20 via-transparent to-transparent p-6">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                          <Calendar className="h-6 w-6 text-primary" />
                          Book a Session
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                          Secure your date with {profile.full_name}.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleBookingSubmit} className="space-y-5">
                        <input type="hidden" name="photographer_id" value={id} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="booking_date" className="text-xs uppercase tracking-widest font-bold text-white/50">Date</Label>
                            <Input
                              id="booking_date"
                              name="booking_date"
                              type="date"
                              required
                              value={formData.booking_date}
                              onChange={handleInputChange}
                              className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-primary focus:border-primary"
                            />
                            {formErrors.booking_date && <p className="text-red-500">{formErrors.booking_date}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="booking_time" className="text-xs uppercase tracking-widest font-bold text-white/50">Time</Label>
                            <Input
                              id="booking_time"
                              name="booking_time"
                              type="time"
                              required
                              value={formData.booking_time}
                              onChange={handleInputChange}
                              className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-primary focus:border-primary"
                            />
                            {formErrors.booking_time && <p className="text-red-500">{formErrors.booking_time}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration" className="text-xs uppercase tracking-widest font-bold text-white/50">Duration (Hours)</Label>
                            <Select value={formData.duration} onValueChange={(val) => handleSelectChange('duration', val)}>
                              <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-white">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(h => (
                                  <SelectItem key={h} value={h.toString()} className="focus:bg-primary/20 focus:text-white">{h}{h === 1 ? '_hour' : '_hours'}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shoot_type" className="text-xs uppercase tracking-widest font-bold text-white/50">Shoot Type</Label>
                            <Select value={formData.shoot_type} onValueChange={(val) => handleSelectChange('shoot_type', val)}>
                              <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-white">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                {profile.specialties?.map(s => (
                                  <SelectItem key={s} value={s.toLowerCase()} className="focus:bg-primary/20 focus:text-white">{s}</SelectItem>
                                )) || ["Portrait", "Wedding", "Event", "Product"].map(s => (
                                  <SelectItem key={s} value={s.toLowerCase()} className="focus:bg-primary/20 focus:text-white">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-xs uppercase tracking-widest font-bold text-white/50">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input
                              id="location"
                              name="location"
                              placeholder="Where will the shoot take place?"
                              required
                              value={formData.location}
                              onChange={handleInputChange}
                              className="pl-10 bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-xs uppercase tracking-widest font-bold text-white/50">Additional Notes</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Any specific requirements or details you'd like to share?"
                            value={formData.message}
                            onChange={handleInputChange}
                            className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-xl focus:ring-primary focus:border-primary resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-md font-bold uppercase tracking-widest bg-primary text-black hover:bg-primary/90 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--primary)]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending Request...
                            </>
                          ) : (
                            "Confirm Booking Request"
                          )}
                        </Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                <div className="space-y-3 text-sm">
                  <h3 className="font-semibold">What&apos;s included:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Professional equipment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Post-processing & editing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>High-resolution digital files</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Online gallery delivery</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
