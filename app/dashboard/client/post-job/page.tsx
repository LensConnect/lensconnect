"use client";

import { JobPostForm } from "@/components/job-post-form";
import { ChevronLeft, PlusSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

export default function PostJobPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 text-foreground">
      <Header />

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl text-xs font-semibold h-8.5 px-3 border-border/80 bg-card hover:bg-muted gap-1.5 shadow-xs"
          >
            <Link href="/dashboard/client">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back to Client Dashboard</span>
            </Link>
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5 border-border/80 bg-background text-muted-foreground">
                <PlusSquare className="h-3 w-3 text-primary" />
                Commission Brief
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Open Listing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Post a Photography Job
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Provide project details to receive proposals from verified creative photographers.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Project Specification
            </h2>
          </div>

          <JobPostForm />
        </div>
      </main>
    </div>
  );
}
