"use client"
import { useState, useEffect } from "react"
import type { Job,  } from "@/lib/types"
import { Calendar, MapPin, Clock, Briefcase } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface JobCardProps {
  job: Job
  onApply?: (jobId: string, message: string, bidAmount: number, photographer_id: string) => void
  isOwner?: boolean
}

interface JobApplication {
  id: string;
  job_id: string;
  photographer_id: string;
  message: string;
  bid_amount: number;
  status: "pending" | "accepted" | "rejected";
  created_at: Date;
}



export function JobCard({ job, onApply, isOwner = false }: JobCardProps) {
  const { user } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState("")
  const [bidAmount, setBidAmount] = useState<number | "">(job.budget)

  const[jobApplication, setJobApplication] = useState<JobApplication | null>(null)
  const [applied, hasApplied] = useState(false)

  const handleOpenModal = () => {
    setMessage("")
    setBidAmount(job.budget)
    setOpenModal(true)
  }


  useEffect(()=>{

    const jobTracking = async() =>{
    
      const {data, error} = await supabase.from("job_applications").select("*").eq("job_id", job.id).eq("photographer_id", user).single()
      if(data){
        setJobApplication(data)
        hasApplied(true)
      
    }
    }
    jobTracking()
  },[ job.id,user])

  const handleConfirmApply = async () => {
    if (!user) {
      toast.error("You must be logged in to apply.")
      return
    }

    const { data, error } = await supabase.from("job_applications").insert({
      job_id: job.id,
      photographer_id: user.id,
      message: message,
      bid_amount: Number(bidAmount),
    })
    
    if (error) {
      console.log(error)
      toast.error("Failed to send application!")
    } else {
      console.log(data)
      toast.success("Application sent successfully!")
      setOpenModal(false)
    }
  }
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
              {job.category}
            </Badge>
            <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
          </div>
          <Badge variant={job.status === "open" ? "secondary" : "outline"} className="capitalize">
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(job.date), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{job.durationHours} hours</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-medium">
            <span className="font-extrabold text-base">₦</span>
            <span>{job.budget}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t bg-muted/30">
        {isOwner ? (
          <Button variant="outline" className="w-full">
            Manage Job
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleOpenModal}
            disabled={job.status !== "open"}
          >
            <Briefcase className={`mr-2 h-4 w-4 ${applied ? "text-green-500" : "text-white"}`} />
            {applied ? "Applied" : "Apply Now"}
          </Button>
        )}
      </CardFooter>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Apply for Job
            </DialogTitle>
            <DialogDescription className="text-sm mt-2 leading-relaxed">
              Submit your proposal for the <span className="font-semibold text-foreground">{job.title}</span> position. Complete the form to send your application to the client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 my-1 flex flex-col space-y-4 shadow-sm">
             <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/50">
               <div>
                  <span className="text-xs text-muted-foreground block mb-1">Client Budget</span>
                  <span className="font-semibold text-primary">₦{job.budget}</span>
               </div>
               <div>
                  <span className="text-xs text-muted-foreground block mb-1">Event Date</span>
                  <span className="font-medium text-sm">{format(new Date(job.date), "PPP")}</span>
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="bidAmount" className="text-sm font-medium">Your Bid (₦)</Label>
               <Input 
                 id="bidAmount"
                 type="number" 
                 value={bidAmount}
                 onChange={(e) => setBidAmount(e.target.value ? Number(e.target.value) : "")}
                 placeholder={`e.g. ${job.budget}`}
                 className="bg-background"
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="message" className="text-sm font-medium">Proposal Message</Label>
               <Textarea 
                 id="message" 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Introduce yourself and explain why you're a great fit for this job..." 
                 className="resize-none min-h-[110px] bg-background"
               />
             </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmApply} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Confirm Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>

  )
}
