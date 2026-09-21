'use server'

import { db } from "@/app/src"
import { sql } from "drizzle-orm";

import { cookies } from "next/headers";
import { verifyToken,SessionPayload } from "@/lib/auth";
import {supabase} from '@/lib/supabaseClient'

export async function sendMessage(
   
    payload: { senderId: number; recipientId: number; content: string }
){


const token = (await cookies()).get('session')?.value;
console.log(token);

const user: SessionPayload  | null = token ? await verifyToken(token) : null;
if(!user){
return ({
error: 'Unauthorized',
})
}

const userIdNum = Number(user.id);
if(Number.isNaN(userIdNum)){
    return ( {status: 400})
}

try{

const [send] = await db.execute(sql`INSERT INTO chatMessage (senderId, recipientId, content) VALUES (${payload.senderId}, ${payload.recipientId}, ${payload.content})`)


const messagePayload = {
    id: crypto.randomUUID(),
    senderId:payload.senderId,
    recipientId:payload.recipientId,
    content:payload.content,
    created_at: new Date().toISOString()
}

await supabase.channel(`room-${payload.senderId}`).send({
    type: 'broadcast',
    event:`room-${payload.senderId}`,
    payload: messagePayload
})
await supabase.channel(`room-${payload.recipientId}`).send({
    type: 'broadcast',
    event:`room-${payload.recipientId}`,
    payload: messagePayload
})
return {send,success:true, data:messagePayload}
}
catch (error) {
    console.error("Database Write Failed:", error);
    // Explicit return to let the Client UI know the action fell apart
    return { success: false, error: "Message failed to deliver." };
  }
}