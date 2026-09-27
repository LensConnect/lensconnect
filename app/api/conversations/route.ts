import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/src";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken, SessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = (await cookies()).get('session')?.value;
  const user: SessionPayload | null = token ? await verifyToken(token) : null;
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = Number(user.id);
  if (Number.isNaN(currentUserId)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
  }

  try {
    // Get all users who have exchanged messages with current user
    // MySQL-compatible query using subqueries - columns are camelCase: senderId, recipientId
    const conversations = await db.execute(sql`
      SELECT 
        u.id,
        u.fullname,
        u.profile_image_url,
        u.role,
        (
          SELECT cm2.content 
          FROM chatmessage cm2 
          WHERE (cm2.senderId = ${currentUserId} AND cm2.recipientId = u.id) 
             OR (cm2.senderId = u.id AND cm2.recipientId = ${currentUserId})
          ORDER BY cm2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT cm2.created_at 
          FROM chatmessage cm2 
          WHERE (cm2.senderId = ${currentUserId} AND cm2.recipientId = u.id) 
             OR (cm2.senderId = u.id AND cm2.recipientId = ${currentUserId})
          ORDER BY cm2.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT cm2.senderId 
          FROM chatmessage cm2 
          WHERE (cm2.senderId = ${currentUserId} AND cm2.recipientId = u.id) 
             OR (cm2.senderId = u.id AND cm2.recipientId = ${currentUserId})
          ORDER BY cm2.created_at DESC 
          LIMIT 1
        ) as last_sender_id,
        (
          SELECT COUNT(*) 
          FROM chatmessage cm3 
          WHERE cm3.recipientId = ${currentUserId} 
            AND cm3.senderId = u.id 
            AND cm3.is_read = false
        ) as unread_count
      FROM users u
      WHERE u.id != ${currentUserId}
        AND EXISTS (
          SELECT 1 FROM chatmessage cm 
          WHERE (cm.senderId = ${currentUserId} AND cm.recipientId = u.id)
             OR (cm.senderId = u.id AND cm.recipientId = ${currentUserId})
        )
      ORDER BY last_message_time DESC
    `);

    return NextResponse.json({ conversations: conversations[0] || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}