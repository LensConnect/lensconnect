"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { JobCard } from "@/components/job-card"
import type { Job } from "@/lib/types"
import { Briefcase, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Header } from "@/components/header"

interface job{
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

const ClientJobsPage = () => {
  const { user } = useAuth()

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["client-jobs", user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw new Error(error.message)

      // Map snake_case to camelCase for the frontend Job type
      return data.map((job: job) => ({
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
    },
    enabled: !!user?.id,
  })

  return (
    <div>
      <Header/>
    <div className="min-h-screen bg-secondary/5 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                <Briefcase className="h-8 w-8" />
              </div>
              My Job Postings
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Manage your photography listings, view applications, and track progress all in one place.
            </p>
          </div>
          <Link href="/dashboard/post-job">
            <Button className="h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="mr-2 h-5 w-5" />
              Post a New Job
            </Button>
          </Link>
        </div>

        {/* Jobs Feed Section */}
        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
              <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Fetching your listings...</p>
            </div>
          ) : error ? (
            <div className="p-12 rounded-3xl bg-destructive/5 border border-destructive/20 text-center space-y-4">
              <h3 className="text-xl font-black text-destructive">Failed to load jobs</h3>
              <p className="text-muted-foreground font-medium">{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl font-bold">Try Again</Button>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} isOwner={true} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 border-4 border-dashed border-border/50 rounded-[40px] bg-background/50">
              <div className="p-6 rounded-full bg-secondary/50">
                <Briefcase className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black tracking-tight">No jobs posted yet</h3>
                <p className="text-muted-foreground font-medium">Capture the moment - start by creating your first photography job listing.</p>
              </div>
              <Link href="/dashboard/post-job">
                <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-2">
                  Create Your First Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default ClientJobsPage