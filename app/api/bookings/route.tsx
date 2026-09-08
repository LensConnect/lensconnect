import {db} from '@/app/src'
import {NextRequest,NextResponse} from 'next/server'
import {booking} from '@/app/src/db/schema'
import {sql} from 'drizzle-orm'
import { verifyToken, SessionPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        photographerId,
        startTime,
        durationHours,
        startDate,
        location,
        messages,
        type,
        status,
        totalPrice
    } = body;

    const token = (await cookies()).get("session")?.value;
    const user: SessionPayload | null = token ? await verifyToken(token) : null;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = Number(user.id);
    const pId = Number(photographerId);
    const durHours = Number(durationHours);
    const tPrice = Number(totalPrice);

    if (
        !pId ||
        !startTime ||
        !startDate ||
        Number.isNaN(durHours) ||
        !location ||
        !type ||
        !status ||
        messages == null ||
        Number.isNaN(tPrice)
    ) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        await db.execute(sql`
            INSERT INTO booking (clientId, photographerId, startDate, startTime, durationHours, location, type, status, messages, totalPrice)
            VALUES (${clientId}, ${pId}, ${startDate}, ${startTime}, ${durHours}, ${location}, ${type}, ${status}, ${messages}, ${tPrice})
        `);

        return NextResponse.json({ message: "Booking created successfully", status: 200, success: true });
    } catch (error) {
        console.error("Booking creation error:", error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}


export async function GET(){
    const token = (await cookies()).get("session")?.value;
    const user: SessionPayload | null = token ? await verifyToken(token) : null;

    if (!user ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bookings = await db.execute(sql`
            SELECT * FROM booking WHERE clientId = ${user.id} AND status = 'accepted'
        `);

        return NextResponse.json({ bookings, status: 200, success: true });
    } catch (error) {
        console.error("Booking retrieval error:", error);
        return NextResponse.json({ error: "Failed to retrieve bookings" }, { status: 500 });
    }
}

export async function  PATCH(req: NextRequest){
    
    const {bookingId, status} = await req.json();

    const token = (await cookies()).get("session")?.value;
    const user: SessionPayload | null = token ? await verifyToken(token) : null;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await db.execute(sql`
            UPDATE booking SET status = ${status} WHERE id = ${bookingId}
        `);

        return NextResponse.json({ message: "Booking updated successfully", status: 200, success: true });
    } catch (error) {
        console.error("Booking update error:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

}