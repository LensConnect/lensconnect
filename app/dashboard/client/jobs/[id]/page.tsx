"use client"

import React, { use } from 'react'
import { Header } from '@/components/header'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { ApplicationCard } from '@/components/application-card'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Briefcase,
  Loader2,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const JobManagementPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const { user } = useAuth()

  // Fetch Job Details
  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })

const { data: applications, isLoading: isLoadingApps } = useQuery({
  queryKey: ['job-applications', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        profiles:photographer_id (
          id,
          full_name,
          profile_image_url,
          location,
          bio,
          hourly_rate,
          specialties
        ),
        photographer_rating_summary (
          rating,
          review_count
        )
      `)
      .eq('job_id', id);

    if (error) throw error;
    return data;
  }
});
  const isLoading = isLoadingJob || isLoadingApps

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumbs / Navigation */}
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/dashboard/client" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Manage Listing</span>
        </div>

        {/* Job Hero Section */}
        {isLoadingJob ? (
          <div className="h-64 rounded-[2rem] bg-secondary/20 animate-pulse mb-12" />
        ) : job && (
          <div className="relative mb-12 p-8 lg:p-12 rounded-[2rem] bg-secondary/20 border border-border/40 overflow-hidden group">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Briefcase className="h-64 w-64 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                  {job.category}
                </Badge>
                <Badge variant="outline" className="px-4 py-1 text-[10px] font-black uppercase tracking-widest border-border/60">
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                  {job.title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/40 shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
                    <p className="font-bold">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/40 shadow-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                    <p className="font-bold">{format(new Date(job.date), "MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/40 shadow-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Budget</p>
                    <p className="font-black text-primary">₦{job.budget?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Section */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b border-border/40 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" /> Proposals
              </h2>
              <p className="text-muted-foreground font-medium">
                {applications?.length || 0} photographers have applied to your project
              </p>
            </div>
          </div>

          {isLoadingApps ? (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 rounded-[2rem] bg-secondary/10 animate-pulse border border-border/20" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-6">
              {applications.map((app: any) => (
                <ApplicationCard 
                  key={app.id} 
                  application={{
                    id: app.id,
                    message: app.message,
                    bid_amount: app.bid_amount,
                    status: app.status,
                    created_at: app.created_at,
                    photographer: {
                      id: app.profiles?.id,
                      full_name: app.profiles?.full_name || "Unknown Photographer",
                      name: app.profiles?.full_name || "Unknown Photographer",
                      avatar: app.profiles?.profile_image_url,
                      location: app.profiles?.location,
                      bio: app.profiles?.bio || "",
                      hourly_rate: app.profiles?.hourly_rate || 0,
                      specialties: app.profiles?.specialties || [],
                      rating: app.photographer_rating_summary?.rating || 5.0,
                      review_count: app.photographer_rating_summary?.review_count || 0
                    }
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center rounded-[3rem] bg-secondary/5 border border-dashed border-border/60">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xl font-bold text-muted-foreground">No proposals yet.</p>
              <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2">
                Hang tight! We're matching your job with our top photographers.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default JobManagementPage