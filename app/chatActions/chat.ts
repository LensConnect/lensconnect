'use server'

import { db } from "@/app/src"
import { sql } from "drizzle-orm";

import { cookies } from "next/headers";
import { verifyToken,SessionPayload } from "@/lib/auth";
import {supabase} from '@/lib/supabaseClient'

export async function sendMessage(
   
    payload: { recipientId: number; content: string }
){


const token = (await cookies()).get('session')?.value;
console.log(token);

const user: SessionPayload  | null = token ? await verifyToken(token) : null;
if(!user){
return ({
error: 'Unauthorized',
})
}

const senderId = Number(user.id);
if(Number.isNaN(senderId)){
    return ( {status: 400})
}

if (!payload.recipientId || !payload.content?.trim()) {
    return { success: false, error: 'Recipient and content are required' };
}

try{

const [send] = await db.execute(sql`INSERT INTO chatmessage (senderId, recipientId, content) VALUES (${senderId}, ${payload.recipientId}, ${payload.content})`)

const generatedId = (send as any).insertId; // Access the generated ID from the result

const messagePayload = {
    id: crypto.randomUUID(),
    senderId,
    recipientId:payload.recipientId,
    content:payload.content,
    created_at: new Date().toISOString()
}
const channel = supabase.channel(`chat_user_${payload.recipientId}`);
await channel.send({
    type: 'broadcast',
    event: 'new-message',
    payload: messagePayload

});


return {success:true, data:messagePayload}
}
catch (error) {
    console.error("Database Write Failed:", error);
    // Explicit return to let the Client UI know the action fell apart
    return { success: false, error: "Message failed to deliver." };
  }
}