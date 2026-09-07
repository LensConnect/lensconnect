"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { JobCard } from "@/components/job-card";
import type { Job } from "@/lib/types";
import { Briefcase, Loader2, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Header } from "@/components/header";

interface JobDbRow {
  id: string;
  title: string;
  status: string;
  location: string;
  category: string;
  date: Date;
  duration_hours: number;
  totalPrice: number;
  client_id: string;
  description: string;
  created_at: Date;
}

export default function ClientJobsPage() {
  const { user } = useAuth();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["client-jobs", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/getClientJobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();

      return data.map((job: JobDbRow) => ({
        id: job.id,
        clientId: job.client_id,
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        date: new Date(job.date),
        durationHours: job.duration_hours,
        totalPrice: job.totalPrice,
        status: job.status,
        createdAt: new Date(job.created_at),
      })) as Job[];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl text-xs font-semibold h-7 px-2.5 border-border/80 bg-background hover:bg-muted gap-1 shadow-xs"
              >
                <Link href="/dashboard/client">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground"
              >
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Job Listings
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              My Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Manage your published listings, review incoming proposals, and track photographer assignments.
            </p>
          </div>

          <Button
            asChild
            className="rounded-xl text-xs font-bold h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5 self-start md:self-auto"
          >
            <Link href="/dashboard/client/post-job">
              <Plus className="h-4 w-4" />
              <span>Post a New Job</span>
            </Link>
          </Button>
        </section>

        {/* Listings Content Area */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="py-24 text-center rounded-3xl border border-border/60 bg-card space-y-3">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Fetching your job postings...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center space-y-3">
              <h3 className="text-sm font-bold text-destructive">Failed to load jobs</h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "An unexpected error occurred."}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold"
              >
                Try Again
              </Button>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} isOwner={true} />
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-foreground">No Jobs Posted Yet</h3>
                <p className="text-xs text-muted-foreground">
                  Ready to hire a creator? Publish your first job post to start receiving quotes and proposals.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 gap-1.5"
              >
                <Link href="/dashboard/client/post-job">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create First Job Post</span>
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}