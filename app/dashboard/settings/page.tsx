"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { mockPhotographers } from "@/lib/mock-data"
import Link from "next/link"

const availableSpecialties = [
  "Events",
  "Portraits",
  "Products",
  "Real Estate",
  "Fashion",
  "Family",
  "Weddings",
  "Commercial",
  "Headshots",
  "Architecture",
  "Lifestyle",
  "Editorial",
]

export default function SettingsPage() {
  
  const router = useRouter()

  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [availability, setAvailability] = useState(true)

 

  const handleSave = () => {
    // In a real app, save to database
    console.log("[v0] Saving settings:", { bio, location, hourlyRate, specialties, availability })
    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your photographer profile and preferences</p>
          </div>
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your profile details visible to clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your photography style and experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="150"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Your base hourly rate for bookings</p>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>Select the types of photography you offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={specialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                   
                  >
                    {specialty}
                    {specialties.includes(specialty) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Click to add or remove specialties</p>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Control whether clients can book you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="availability" className="text-base">
                    Available for bookings
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, clients won &apos;t be able to send booking requests
                  </p>
                </div>
                <Switch id="availability" checked={availability} onCheckedChange={setAvailability} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
