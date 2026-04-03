import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin } from "lucide-react"
import type { PhotographerProfile, User } from "@/lib/types"

interface PhotographerCardProps {
  photographer: PhotographerProfile & { user: User }
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  return (
    <Link href={`/photographer/${photographer.userId}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={photographer.portfolioImages[0] || "/placeholder.svg"}
            alt={photographer.user.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!photographer.availability && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/90">
                Unavailable
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={photographer.user.avatar || "/placeholder.svg"} alt={photographer.user.name} />
              <AvatarFallback>{photographer.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{photographer.user.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{photographer.location}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{photographer.bio}</p>

          <div className="flex flex-wrap gap-1">
            {photographer.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{photographer.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({photographer.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span className="font-extrabold text-base">₦</span>
              <span>{photographer.hourlyRate}/hr</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
