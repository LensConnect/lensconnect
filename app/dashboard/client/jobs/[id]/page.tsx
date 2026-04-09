"use client"

import React, { useState, use } from 'react'
import { Header } from '@/components/header';


interface JobApplication {
  id: string;
  job_id: string;
  photographer_id: string;
  message: string;
  bid_amount: number;
  status: "pending" | "accepted" | "rejected";
  created_at: Date;
}

const page = ({params}: {params:Promise<{id:string}>}) => {
const { id } = use(params)
const [applications, setApplications] = useState<JobApplication | null>(null)

  return (
    <div>
      <Header></Header>  
    </div>
  )
}

export default page