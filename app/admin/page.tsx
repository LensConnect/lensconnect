"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Camera, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react"
import { mockPhotographers, mockBookings, mockReviews } from "@/lib/mock-data"

export default function AdminDashboardPage() {

  const router = useRouter()

  
  // Calculate stats
  const totalPhotographers = mockPhotographers.length
  const totalBookings = mockBookings.length
  const completedBookings = mockBookings.filter((b) => b.status === "completed").length
  const totalRevenue = mockBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalPrice, 0)
  const platformFee = totalRevenue * 0.15 // 15% platform fee
  const averageRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length || 0

  const thisMonthBookings = mockBookings.filter((b) => {
    const bookingMonth = b.date.getMonth()
    const currentMonth = new Date().getMonth()
    return bookingMonth === currentMonth
  }).length

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Photographers</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPhotographers}</div>
              <p className="text-xs text-green-600 mt-1">+3 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">{thisMonthBookings} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${platformFee.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">15% of ${totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">From {mockReviews.length} reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="photographers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="photographers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Photographers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPhotographers.map((photographer) => (
                    <div
                      key={photographer.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={photographer.user.avatar || "/placeholder.svg"}
                          alt={photographer.user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{photographer.user.name}</p>
                          <p className="text-sm text-muted-foreground">{photographer.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{photographer.rating.toFixed(1)}</p>
                          <p className="text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{photographer.reviewCount}</p>
                          <p className="text-muted-foreground">Reviews</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">${photographer.hourlyRate}</p>
                          <p className="text-muted-foreground">Per Hour</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBookings.map((booking) => {
                    const photographer = mockPhotographers.find((p) => p.userId === booking.photographerId)
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{booking.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {photographer?.user.name} • {booking.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {booking.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${booking.totalPrice}</p>
                            <p className="text-xs text-muted-foreground">{booking.duration}h</p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "confirmed"
                                  ? "bg-blue-100 text-blue-700"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReviews.map((review) => {
                    const photographer = mockPhotographers.find((p) => p.userId === review.photographerId)
                    return (
                      <div key={review.id} className="p-4 border border-border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={photographer?.user.avatar || "/placeholder.svg"}
                              alt={photographer?.user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <p className="font-semibold">{photographer?.user.name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-muted"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(completedBookings / totalBookings) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{completedBookings}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confirmed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(mockBookings.filter((b) => b.status === "confirmed").length / totalBookings) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {mockBookings.filter((b) => b.status === "confirmed").length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{
                              width: `${(mockBookings.filter((b) => b.status === "pending").length / totalBookings) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {mockBookings.filter((b) => b.status === "pending").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Photographers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPhotographers
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((photographer, index) => (
                        <div key={photographer.id} className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-muted-foreground w-6">{index + 1}</span>
                          <img
                            src={photographer.user.avatar || "/placeholder.svg"}
                            alt={photographer.user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{photographer.user.name}</p>
                            <p className="text-xs text-muted-foreground">{photographer.reviewCount} reviews</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-semibold">{photographer.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">New Users</p>
                        <p className="text-xs text-muted-foreground">+12 this week</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Active Sessions</p>
                        <p className="text-xs text-muted-foreground">24 ongoing bookings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Revenue Growth</p>
                        <p className="text-xs text-muted-foreground">+18% vs last month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Weddings", count: 45, color: "bg-pink-500" },
                      { name: "Portraits", count: 38, color: "bg-purple-500" },
                      { name: "Events", count: 32, color: "bg-blue-500" },
                      { name: "Products", count: 28, color: "bg-green-500" },
                      { name: "Real Estate", count: 24, color: "bg-orange-500" },
                    ].map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${category.color}`}
                              style={{ width: `${(category.count / 45) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
