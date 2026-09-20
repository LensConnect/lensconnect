import {NextResponse, NextRequest} from "next/server";
import { db } from "@/app/src"
import { sql } from "drizzle-orm";

import { cookies } from "next/headers";
import { verifyToken,SessionPayload } from "@/lib/auth";


export async function  POST(req: NextRequest){
const body = await req.json()

const {senderId, recipientId, content} = await body

const token = (await cookies()).get('session')?.value;
console.log(token);

const user: SessionPayload  | null = token ? await verifyToken(token) : null;
if(!user){
return NextResponse.json({
error: 'Unauthorized',
})
}

const userIdNum = Number(user.id);
if(Number.isNaN(userIdNum)){
    return NextResponse.json({error:'Invalid user'}, {status: 400})
}

const  [send] = await db.execute(sql`INSERT INTO chatmessage (senderId, recipientId, content) VALUES (${senderId}, ${recipientId}, ${content})`)

return NextResponse.json(send, )
}