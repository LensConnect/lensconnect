import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Search } from "lucide-react"
import type { PhotographerProfile, User } from "@/lib/types"
import Image from "next/image"

interface PhotographerCardProps {
  photographer: PhotographerProfile & { user: User }
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  return (
    <Link
      href={`/photographer/${photographer.user.name}/${photographer.userId}`}
      className="group block break-inside-avoid h-full"
    >
      <div className="relative rounded-[2rem] overflow-hidden bg-secondary/20 hover:bg-secondary/40 transition-all duration-500 border border-border/40 h-full flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1">
        
        {/* Cinema-style Image Mask */}
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          {photographer.portfolioImages?.[0] ? (
            <Image
              src={photographer.portfolioImages[0]}
              alt={photographer.user.name}
              fill
              className="object-cover group-hover:scale-[1.05] origin-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/80">
              <span className="text-8xl font-light text-muted opacity-30">
                {photographer.user.name?.charAt(0) || "P"}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          {!photographer.availability && (
            <div className="absolute top-4 right-4 z-20">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Unavailable
              </Badge>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Hover action */}
          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20 flex justify-between items-end">
             <span className="text-white font-bold tracking-tight text-sm">View Portfolio</span>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
               <Search className="w-4 h-4" />
             </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="p-6 relative z-10 bg-background/5 backdrop-blur-sm group-hover:bg-transparent transition-colors duration-500 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors truncate">
                {photographer.user.name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {photographer.location || "Worldwide"}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black tracking-tight text-primary">₦</span>
                <span className="text-xl font-black tracking-tight text-primary">{photographer.hourlyRate}</span>
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">/hour</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-5 font-bold text-sm">
            <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-0.5 rounded-md border border-yellow-400/20">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{photographer.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-xs ml-1">· {photographer.reviewCount} reviews</span>
          </div>

          {photographer.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {photographer.specialties.slice(0, 3).map((specialty, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-2.5 py-0.5 bg-secondary/50 text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border/50"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
