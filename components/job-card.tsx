"use client"
import React, { useState, useEffect } from "react"
import type { Job } from "@/lib/types"
import { Calendar, MapPin, Clock, Briefcase, TrendingUp, CircleCheckBig, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

interface JobCardProps {
  job: Job
  onApply?: (jobId: string, message: string, bidAmount: number, photographer_id: string) => void
  isOwner?: boolean
  isApplied?: boolean
}

export function JobCard({ job, onApply, isOwner = false, isApplied = false }: JobCardProps) {
  const { user } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [bidAmount, setBidAmount] = useState<number | "">(job.totalPrice || "")
  const [applied, setApplied] = useState(isApplied)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    setApplied(isApplied)
  }, [isApplied])

  const bidAmountNumber = Number(bidAmount)
  const isJobApplied = applied || isApplied

  const handleOpenModal = () => {
    createMutation.reset()
    setMessage("")
    setBidAmount(job.totalPrice || "")
    setOpenModal(true)
  }

  const createMutation = useMutation({
    mutationKey: ["job-application", job.id, user?.id],
    mutationFn: async (data: { message: string; bidAmount: number; jobId: string }) => {
      const response = await fetch('/api/applyJobs', {
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'An unexpected error occurred');
      }

      return responseData;
    },
    onSuccess: () => {
      setApplied(true);
      setOpenModal(false);
      toast.success("Application sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onApply && user?.id) {
        onApply(job.id, message, bidAmountNumber, user.id);
      }
    },
    onError: (error: Error) => {
      if (error.message === "You have already applied for this job") {
        setApplied(true);
        setOpenModal(false);
        toast.error("You have already applied for this job.");
        queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      } else {
        toast.error(error.message || "Failed to send application!");
      }
    }
  });

  const handleConfirmApply = async () => {
    if (!user) {
      toast.error("Please log in to apply for jobs");
      return;
    }
    if (user.role !== "photographer") {
      toast.error("Only photographers can apply for jobs");
      return;
    }
    if (isNaN(bidAmountNumber) || bidAmountNumber <= 0) {
      toast.error("Please enter a valid bid price");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a short proposal message");
      return;
    }
    if (message.length > 255) {
      toast.error("Proposal message must be 255 characters or less");
      return;
    }

    createMutation.mutate({
      message: message.trim(),
      bidAmount: bidAmountNumber,
      jobId: job.id
    });
  }

  const isNew = job.createdAt && !isNaN(new Date(job.createdAt).getTime())
    ? new Date().getTime() - new Date(job.createdAt).getTime() < 24 * 60 * 60 * 1000
    : false;

  const formattedDate = job.date && !isNaN(new Date(job.date).getTime())
    ? format(new Date(job.date), "MMM d, yyyy")
    : "Flexible";

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-border/50 bg-background/50 backdrop-blur-sm shadow-sm rounded-2xl ${isJobApplied ? 'opacity-80' : ''}`}>
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-2 py-0 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                {job.category}
              </Badge>
              {isNew && (
                <Badge variant="outline" className="px-2 py-0 border-accent/50 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  New
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
          </div>
          <Badge 
            variant={job.status === "open" ? "default" : "secondary"} 
            className={`capitalize h-6 px-3 rounded-full text-[10px] font-bold ${job.status === 'open' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' : ''}`}
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6 relative">
        <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed line-clamp-3">
          {job.description}
        </p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary transition-colors">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-foreground/70 truncate">{job.location}</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary transition-colors">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-foreground/70 truncate">
              {formattedDate}
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary transition-colors">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-foreground/70 truncate">{job.durationHours} Hours</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Budget</span>
              <span className="text-sm font-black text-primary">₦{job.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 relative">
        {isOwner ? (
          <Button onClick={() => router.push(`/dashboard/client/jobs/${job.id}`)} variant="outline" className="w-full rounded-xl font-bold text-xs uppercase tracking-widest h-11 border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
            Manage Listing
          </Button>
        ) : (
          <Button 
            className={`w-full rounded-xl font-bold text-xs uppercase tracking-widest h-11 transition-all duration-300 shadow-lg ${isJobApplied ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"}`}
            onClick={handleOpenModal}
            disabled={job.status !== "open" || isJobApplied}
          >
            {isJobApplied ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                Applied
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Apply for this Job
              </span>
            )}
          </Button>
        )}
      </CardFooter>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden [&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:top-6 [&_[data-slot=dialog-close]]:right-6">
          <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Briefcase className="h-32 w-32" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-black tracking-tighter text-white">Submit Proposal</DialogTitle>
              <DialogDescription className="text-white/80 font-medium">
                Apply for {job.title}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Status Messages */}
            {isJobApplied && !createMutation.isError && (
              <div className="p-4 border rounded-xl bg-emerald-50 border-emerald-200 flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-emerald-800">
                  <CircleCheckBig className="h-5 w-5 text-emerald-600" />
                  Application Submitted!
                </div>
                <p className="text-sm text-emerald-700">
                  Your application was sent successfully. The client has been notified.
                </p>
              </div>
            )}
            
            {createMutation.isError && (
              <div className="p-4 border rounded-xl bg-rose-50 border-rose-200 flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-rose-800">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  Submission Failed
                </div>
                <p className="text-sm text-rose-700">
                  {createMutation.error.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Budget</span>
                <span className="text-lg font-black text-primary">₦{job.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Duration</span>
                <span className="text-lg font-black text-foreground">{job.durationHours} hrs</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bidAmount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Bid Price (₦)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₦</span>
                  <Input 
                    id="bidAmount"
                    type="number" 
                    min="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value ? Number(e.target.value) : "")}
                    className="pl-8 h-12 rounded-xl bg-secondary/30 border-none focus-visible:ring-primary font-bold"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cover Letter / Message</Label>
                  <span className={`text-[10px] font-bold ${message.length > 240 ? "text-amber-500" : "text-muted-foreground"}`}>
                    {255 - message.length} chars left
                  </span>
                </div>
                <Textarea 
                  id="message" 
                  maxLength={255}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why are you the perfect photographer for this job?" 
                  className="resize-none min-h-[120px] rounded-xl bg-secondary/30 border-none focus-visible:ring-primary font-medium p-4 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="w-full rounded-xl font-bold h-12 border-border/50">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleConfirmApply} 
                disabled={createMutation.isPending || isJobApplied} 
                className="w-full rounded-xl font-bold h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : isJobApplied ? (
                  "Already Applied"
                ) : (
                  "Confirm Application"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
