"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/header";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  Search,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { JobApplication } from "@/lib/types";
import Link from "next/link";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading, error: queryError } = useQuery<JobApplication[]>({
    queryKey: ["job-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch("/api/applyJobs", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "Failed to fetch applications";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
  });

  const applicationList = Array.isArray(applications) ? applications : [];

  async function fetchUnread() {
    if (!user?.id) return [];

    try {
      const response = await fetch("/api/read_applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "Failed to mark applications as read";
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (applicationList.length > 0) {
      fetchUnread();
    }
  }, [user?.id, applicationList.length]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return {
          icon: CheckCircle2,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          label: "Proposal Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-500/10 border-rose-500/20",
          label: "Declined",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-500/10 border-amber-500/20",
          label: "Under Review",
        };
    }
  };

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
                <Link href="/dashboard">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground"
              >
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Proposals Tracker
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Submitted Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review and track the real-time status of your bids, client responses, and messages.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-xl text-xs font-semibold h-9 px-4 border-border/80 bg-card hover:bg-muted shadow-xs gap-1.5 self-start md:self-auto"
          >
            <Link href="/photographer/find-jobs">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>Browse Open Jobs</span>
            </Link>
          </Button>
        </section>

        {/* Applications Feed */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="py-24 text-center rounded-3xl border border-border/60 bg-card space-y-3">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Loading your submitted proposals...</p>
            </div>
          ) : queryError ? (
            <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center space-y-3">
              <XCircle className="h-8 w-8 mx-auto text-destructive" />
              <h3 className="text-sm font-bold text-destructive">Failed to Load Applications</h3>
              <p className="text-xs text-muted-foreground">
                {(queryError as Error).message || "An unexpected error occurred."}
              </p>
            </div>
          ) : applicationList.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-border/80 bg-card/50 flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-foreground">No Applications Submitted</h3>
                <p className="text-xs text-muted-foreground">
                  Browse open job listings and send your first creative proposal to potential clients.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 gap-1.5"
              >
                <Link href="/photographer/find-jobs">
                  <Search className="h-3.5 w-3.5" />
                  <span>Find Jobs</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {applicationList.map((app) => {
                const status = getStatusConfig(app.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={app.id}
                    className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                        <div className="space-y-1 min-w-0">
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                            {app.jobs?.category || "General"}
                          </Badge>
                          <h3 className="text-base font-bold text-foreground truncate">
                            {app.jobs?.title || "Project Commission"}
                          </h3>
                        </div>

                        <Badge
                          variant="outline"
                          className={`${status.bg} ${status.color} font-semibold px-2 py-0.5 text-[10px] rounded-full border shrink-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      {/* Job metadata */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground p-2 rounded-xl bg-muted/40">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate text-[11px]">{app.jobs?.location || "Remote"}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground p-2 rounded-xl bg-muted/40">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate text-[11px]">
                            {app.jobs?.date ? format(new Date(app.jobs.date), "MMM d, yyyy") : "Date TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Proposal Message */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Your Proposal Message
                        </span>
                        <p className="text-xs text-foreground/85 bg-muted/30 p-3 rounded-2xl border border-border/50 line-clamp-3 leading-relaxed italic">
                          "{app.message}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Bid Info */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                          Your Bid
                        </span>
                        <span className="text-base font-extrabold font-mono text-primary">
                          ₦{(Number(app.bidAmount) || 0).toLocaleString()}
                        </span>
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {app.created_at ? format(new Date(app.created_at), "MMM d, yyyy") : "Recently sent"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}