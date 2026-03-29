"use client"

import { JobPostForm } from "@/components/job-post-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function PostJobPage() {
  return (
    <>
    <Header/>
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/client-dashboard" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the details below to find the perfect photographer for your needs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide clear information about your project to attract the right professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostForm />
        </CardContent>
      </Card>
    </div>
    </>
  )
}
