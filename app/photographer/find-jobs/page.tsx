"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Job } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";

export default function FindJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const { user } = useAuth();

  // Fetch all open jobs
  const { data: dbJobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/getJobs", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((job: any) => ({
        id: String(job.id),
        clientId: String(job.clientId ?? job.client_id ?? ""),
        title: job.title || "",
        description: job.description || "",
        location: job.location || "Remote",
        category: job.category || "General",
        date: job.date ? new Date(job.date) : new Date(),
        durationHours: Number(job.duration_hours ?? job.durationHours ?? 0),
        status: job.status || "open",
        totalPrice: Number(job.totalPrice ?? 0),
        createdAt: job.createdAt
          ? new Date(job.createdAt)
          : job.created_at
          ? new Date(job.created_at)
          : new Date(),
      })) as Job[];
    },
  });

  // Fetch current photographer's applied jobs to synchronize status
  const { data: appliedJobsData } = useQuery({
    queryKey: ["job-applications", user?.id],
    queryFn: async () => {
      if (!user?.id || user.role !== "photographer") return [];
      const response = await fetch("/api/applyJobs");
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id && user?.role === "photographer",
  });

  const appliedJobIdSet = useMemo(() => {
    return new Set((appliedJobsData || []).map((app: any) => String(app.jobId)));
  }, [appliedJobsData]);

  const allJobs = dbJobs || [];

  const filteredJobs = allJobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" ||
      job.category.toLowerCase() === categoryFilter.toLowerCase();

    const locQuery = locationFilter.trim().toLowerCase();
    const matchesLocation =
      !locQuery || job.location.toLowerCase().includes(locQuery);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLocationFilter("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      {/* Header Banner */}
      <section className="border-b border-border/80 bg-card py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground"
            >
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Opportunities
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Open Job Feed</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Explore Open Photography Jobs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Submit proposals on open client commissions across weddings, editorial, portrait, commercial, and events.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Filters
                  </span>
                </div>
                {(searchQuery || categoryFilter !== "all" || locationFilter) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Keywords, skills, city..."
                    className="pl-9 h-9 rounded-xl bg-background border-border/80 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Shoot Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 rounded-xl bg-background border-border/80 text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                    <SelectItem value="weddings" className="text-xs">Weddings</SelectItem>
                    <SelectItem value="portraits" className="text-xs">Portraits</SelectItem>
                    <SelectItem value="events" className="text-xs">Events</SelectItem>
                    <SelectItem value="headshots" className="text-xs">Headshots</SelectItem>
                    <SelectItem value="commercial" className="text-xs">Commercial</SelectItem>
                    <SelectItem value="fashion" className="text-xs">Fashion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Lagos, Abuja, London..."
                    className="pl-9 h-9 rounded-xl bg-background border-border/80 text-xs"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Creator Tip</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Photographers with complete portfolios and specialty tags receive 3x more proposal acceptances.
              </p>
            </div>
          </aside>

          {/* Job Feed Area */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{filteredJobs.length} {filteredJobs.length === 1 ? "Job Available" : "Jobs Available"}</span>
              </h2>

              <span className="text-xs text-muted-foreground font-medium">
                Live Open Listings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isLoading ? (
                <div className="col-span-full py-24 text-center rounded-3xl border border-border/60 bg-card space-y-3">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Loading available jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isApplied={appliedJobIdSet.has(String(job.id))}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Jobs Match Criteria</h3>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search keywords, location filter, or category selection.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="rounded-xl text-xs font-bold mt-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
