'use client'
import React from 'react'
import { Header } from '@/components/header'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { format } from "date-fns"
import { Calendar, MapPin, Clock, Briefcase, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/lib/auth-context'
import type { Job } from '@/lib/types'

interface JobApplicationWithJob {
  id: string;
  job_id: string;
  photographer_id: string;
  message: string;
  bid_amount: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  jobs: Job;
}

const ApplicationsPage = () => {
    const { user } = useAuth()
    
    const { data: applications, isLoading } = useQuery({
        queryKey: ["job-applications", user?.id],
        queryFn: async () => {
            if (!user?.id) return []
            
            const { data, error } = await supabase
                .from("job_applications")
                .select("*, jobs(*)")
                .eq("photographer_id", user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data as JobApplicationWithJob[]
        },
        enabled: !!user?.id
    })

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'accepted': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
        case 'rejected': return 'bg-destructive/10 text-destructive hover:bg-destructive/20'
        default: return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'accepted': return <CheckCircle2 className="w-4 h-4 mr-1" />
        case 'rejected': return <XCircle className="w-4 h-4 mr-1" />
        default: return <Clock className="w-4 h-4 mr-1" />
      }
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col gap-2 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                  <p className="text-muted-foreground">Track the status of your job proposals</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : applications?.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                        <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No applications yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start browsing jobs to send your first proposal.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {applications?.map((app) => (
                            <Card key={app.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
                                                {app.jobs?.category || 'General'}
                                            </Badge>
                                            <CardTitle className="text-lg font-bold line-clamp-1">
                                                {app.jobs?.title || 'Unknown Job'}
                                            </CardTitle>
                                        </div>
                                        <Badge variant="secondary" className={`${getStatusStyle(app.status)} capitalize flex items-center shrink-0`}>
                                            {getStatusIcon(app.status)}
                                            {app.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow pt-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">{app.jobs?.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span className="truncate">{app.jobs?.date ? format(new Date(app.jobs.date), "MMM d, yyyy") : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <span className="text-primary font-extrabold border bg-muted/30 px-1.5 rounded text-xs py-0.5">Your Bid</span>
                                            <span className="font-semibold text-foreground">₦{app.bid_amount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs justify-end">
                                            Sent {format(new Date(app.created_at), "MMM d")}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Your Proposal Message</h4>
                                        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/50 line-clamp-3">
                                            {app.message}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default ApplicationsPage