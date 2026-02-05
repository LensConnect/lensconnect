import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Photographer Not Found</h1>
          <p className="text-muted-foreground">The photographer you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/search">Browse Photographers</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
