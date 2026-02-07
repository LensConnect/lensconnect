import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, DollarSign, Calendar, MessageSquare, CheckCircle2 } from "lucide-react"
import { mockPhotographers, mockReviews } from "@/lib/mock-data"
import Link from "next/link"

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

export default async function PhotographerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch photographer profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch photographer portfolio
  const { data: portfolio, error: portfolioError } = await supabase
    .from("photographer_portfolio")
    .select("*")
    .eq("photographer_id", id)

  const portfolioItems: PortfolioItem[] = portfolio || []

  // Mock reviews for now since no table exists
  const photographerReviews: any[] = []

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
                    <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} alt={profile.full_name} className="object-cover"/>
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
                              year: "numeric",
                              month: "long",
                              day: "numeric",
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
                  <Button className="w-full" size="lg" disabled={!profile.availability} asChild>
                    <Link href={`/booking/${profile.id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg" asChild>
                    <Link href={`/messages?to=${profile.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                </div>

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
