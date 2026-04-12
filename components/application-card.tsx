"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, DollarSign, MessageSquare, Check, X, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface ApplicationCardProps {
  application: {
    id: string
    message: string
    bid_amount?: number
    status: "pending" | "accepted" | "rejected"
    created_at: Date | string
    photographer: {
      name: string
      avatar?: string
      location?: string
      rating: number
      review_count: number
    }
  }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const isPending = application.status === "pending"
  
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
              <div className="relative">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-primary/20 p-1 bg-background">
                  <AvatarImage src={application.photographer.avatar} alt={application.photographer.name} />
                  <AvatarFallback className="font-black text-xl">{application.photographer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background ring-2 ring-transparent group-hover:ring-green-500/20 transition-all" />
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors leading-tight">
                  {application.photographer.name}
                </h3>
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

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-border/30 rounded-full" />
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic pl-2">
                  "{application.message}"
                </p>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex lg:flex-col gap-3 shrink-0">
              <Button size="lg" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                <Check className="h-4 w-4 mr-2" /> Accept
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 border-border/60 hover:bg-secondary/50">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button size="lg" variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 flex-1 lg:w-40 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                <X className="h-4 w-4 mr-2" /> Decline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
