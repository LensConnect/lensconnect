"use client"

import type { Job } from "@/lib/types"
import { Calendar, MapPin, Clock, DollarSign, Briefcase } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface JobCardProps {
  job: Job
  onApply?: (jobId: string) => void
  isOwner?: boolean
}

export function JobCard({ job, onApply, isOwner = false }: JobCardProps) {
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
            <DollarSign className="h-4 w-4" />
            <span>${job.budget}</span>
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
            onClick={() => onApply?.(job.id)}
            disabled={job.status !== "open"}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        )}
      </CardFooter>
    </Card>

  )
}
