"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import type { Job } from "@/lib/types"
import { JobCard } from "@/components/job-card"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Briefcase,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import {Header} from "@/components/header"


interface jobs{
  id:string;
  title:string;
  status:string;
  location:string;
  category:string;
  date:Date;
  duration_hours:number;
  budget:number;
  client_id:string;
  description:string;
  created_at:Date;
}

export default function FindJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const { data: dbJobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      if (error) throw error
      
      return data.map((job:jobs) => ({
        id: job.id,
        clientId: job.client_id,
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        date: new Date(job.date),
        durationHours: job.duration_hours,
        budget: job.budget,
        status: job.status,
        createdAt: new Date(job.created_at)
      })) as Job[]
    }
  })

  const allJobs = dbJobs || []

  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleApply = (jobId: string) => {
    console.log(`Applying to job ${jobId}`)
    // This would open an application modal in a real implementation
  }

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col font-sans selection:bg-accent selection:text-white">
      <Header />
      
      {/* Elevated Header Section */}
      <div className="bg-background border-b border-border/40 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Find Photography Jobs</h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Browse open listings, discover your next creative project, and connect with high-end clients.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 md:px-6 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 md:gap-12">
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 self-start">
          <Card className="p-6 border-border/50 shadow-sm rounded-2xl bg-background">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 tracking-tight">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search keywords..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Weddings">Weddings</SelectItem>
                    <SelectItem value="Portraits">Portraits</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Headshots">Headshots</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Anywhere" className="pl-9" />
                </div>
              </div>

              <Button className="w-full mt-2" variant="outline" onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
              }}>
                Reset Filters
              </Button>
            </div>
          </Card>

          <Alert className="bg-primary/5 border-primary/20 text-primary rounded-xl">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-bold tracking-tight">Pro Tip</AlertTitle>
            <AlertDescription className="font-medium mt-1">
              Complete your portfolio to increase your chances of being hired by 40%.
            </AlertDescription>
          </Alert>
        </div>

        {/* Job Listings Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              {filteredJobs.length} Jobs Found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
               <div className="col-span-full py-20 text-center space-y-4">
                 <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                 <p className="text-muted-foreground">Loading jobs...</p>
               </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onApply={handleApply}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed rounded-xl">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
