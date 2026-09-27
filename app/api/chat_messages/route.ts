import {NextResponse, NextRequest} from "next/server";
import { db } from "@/app/src"
import { sql } from "drizzle-orm";

import { cookies } from "next/headers";
import { verifyToken,SessionPayload } from "@/lib/auth";


export async function  POST(req: NextRequest){
const body = await req.json()

const {recipientId, content} = await body

const token = (await cookies()).get('session')?.value;
console.log(token);

const user: SessionPayload  | null = token ? await verifyToken(token) : null;
if(!user){
return NextResponse.json({
error: 'Unauthorized',
})
}

const senderId = Number(user.id);
if(Number.isNaN(senderId)){
    return NextResponse.json({error:'Invalid user'}, {status: 400})
}

if (!recipientId || !content?.trim()) {
    return NextResponse.json({error: 'recipientId and content are required'}, {status: 400});
}

const recipientIdNum = Number(recipientId);
if (Number.isNaN(recipientIdNum)) {
    return NextResponse.json({error: 'Invalid recipient'}, {status: 400});
}

const  [send] = await db.execute(sql`INSERT INTO chatmessage (senderId, recipientId, content) VALUES (${senderId}, ${recipientIdNum}, ${content})`)

return NextResponse.json(send, )
}


export async function GET(req: NextRequest){
    const token =((await cookies()).get('session')?.value);
    console.log(token);

    const user: SessionPayload | null = token ? await verifyToken(token) : null;
    if(!user){
        return NextResponse.json({
            error: 'Unauthorized',
        }, { status: 401 })
    }

    const currentUserId = Number(user.id);
    if (Number.isNaN(currentUserId)) {
        return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const otherUserId = Number(req.nextUrl.searchParams.get('recipientId'));
    if (Number.isNaN(otherUserId)) {
        return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }


    const [messages] = await db.execute(sql`SELECT * FROM chatmessage WHERE (senderId = ${currentUserId} AND recipientId = ${otherUserId}) OR (senderId = ${otherUserId} AND recipientId = ${currentUserId}) ORDER BY created_at ASC`);
    return NextResponse.json({ messages });
}