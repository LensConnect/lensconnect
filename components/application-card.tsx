"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, DollarSign, MessageSquare, Check, X, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ApplicationCardProps {
  application: {
    id: string
    message: string
    bid_amount?: number
    status: "pending" | "accepted" | "rejected"
    created_at: Date | string
    photographer: {
      id: string;
      full_name: string;
      hourly_rate: number;
       specialties: string[];
      name: string
      avatar?: string
       bio: string;
      location?: string
      rating: number
      review_count: number
    }
  }
}

export function ApplicationCard({ application}: ApplicationCardProps) {
  const isPending = application.status === "pending"

  const accepted = application.status === 'accepted'
  const rejected = application.status === 'rejected'

const router = useRouter()


  async function updateJobStatus(){

      const {data:updateJob, error:updateError} = await supabase.from('job_applications').update({status: 'accepted'}).eq('id', application.id)
      
      if (updateError) throw new Error(updateError.message)

         return updateJob

  }

  async function updateJobStatusRejected(){

      const {data:updateJobRejected, error:updateErrorRejected} = await supabase.from('job_applications').update({status: 'rejected'}).eq('id', application.id)
      
      if (updateErrorRejected) throw new Error(updateErrorRejected.message)

         return updateJobRejected

  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
        {/* Premium Gradient Accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />
        
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Photographer Info */}
            <div className="flex flex-row lg:flex-col items-start gap-4 lg:w-48 shrink-0">
              <Link 
                href={`/photographer/${application.photographer.full_name}/${application.photographer.id}`}
                className="relative block hover:scale-105 transition-transform duration-300"
              >
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-primary/20 p-1 bg-background">
                  <AvatarImage src={application.photographer.avatar} alt={application.photographer.name} />
                  <AvatarFallback className="font-black text-xl">{application.photographer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background ring-2 ring-transparent group-hover:ring-green-500/20 transition-all" />
              </Link>
              
              <div className="flex-1 space-y-1">
                <Link 
                  href={`/photographer/${application.photographer.full_name}/${application.photographer.id}`}
                  className="block group/name"
                >
                  <h3 className="font-black text-lg tracking-tight group-hover/name:text-primary transition-colors leading-tight">
                    {application.photographer.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  <MapPin className="h-3 w-3 text-primary" />
                  {application.photographer.location || "Available Worldwide"}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-0.5 rounded-md border border-yellow-400/20 text-[10px] font-black">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {application.photographer.rating.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">({application.photographer.review_count} reviews)</span>
                </div>

                {/* Specialties */}
                {application.photographer.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {application.photographer.specialties.slice(0, 2).map((s, i) => (
                      <Badge key={i} variant="secondary" className="px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter bg-secondary/50">
                        {s}
                      </Badge>
                    ))}
                    {application.photographer.specialties.length > 2 && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter">
                        +{application.photographer.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Proposal Details */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-2xl border border-border/30 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Proposed Bid</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-primary">₦</span>
                    <span className="text-3xl font-black tracking-tight text-foreground">
                      {application.bid_amount?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl border border-border/30 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Submitted On</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-lg font-black tracking-tight text-foreground">
                      {format(new Date(application.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative space-y-4">
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-border/30 rounded-full" />
                  <p className="text-sm text-foreground font-medium leading-relaxed italic pl-2">
                    "{application.message}"
                  </p>
                </div>
                
                {/* Photographer Bio Snippet */}
                {application.photographer.bio && (
                  <div className="bg-secondary/20 p-4 rounded-2xl border border-border/20">
                    <div className="flex items-center gap-2 mb-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <Star className="h-3 w-3 text-primary" /> About the Artist
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {application.photographer.bio}
                    </p>
                  </div>
                )}

                {/* Hourly Rate context */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <span>Standard Rate: <span className="text-foreground">₦{application.photographer.hourly_rate?.toLocaleString()}/hr</span></span>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex lg:flex-col gap-3 shrink-0">
              
              <Button  onClick={updateJobStatus} size="lg" className="rounded-xl font-black cursor-pointer uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
              {accepted ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Accepted
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Accept
                </>
              )}  
              </Button>
              <Button onClick={() => router.push('/messages')} size="lg" variant="outline" className="rounded-xl cursor-pointer font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 border-border/60 hover:bg-secondary/50">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button onClick={updateJobStatusRejected} size="lg" variant="ghost" className="rounded-xl cursor-pointer font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                {rejected ? (
                 <>
                <X className="h-4 w-4 mr-2" /> Declined
                </>
                ) : (
                  <>
                  <X className="h-4 w-4 mr-2" /> Decline  
                  </>
                )}
              </Button>

            </div>

          
          </div>
          
        </CardContent>
        <CardFooter className="w-[300px] mx-auto">
          <Button onClick={() => router.push(`/photographer/${application.photographer.full_name}/${application.photographer.id}`)} className="rounded-xl w-full mx-auto cursor-pointer font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">View Profile</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
