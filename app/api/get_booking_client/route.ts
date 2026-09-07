import { NextResponse, NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/app/src";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const clientId = searchParams.get("clientId") || searchParams.get("id");

    if (!clientId) {
      return NextResponse.json([]);
    }

    const [rows] = await db.execute(
      sql` 
      SELECT 
        b.id,
        b.clientId as client_id,
        b.photographerId as photographer_id,
        b.startDate,
        b.startTime as start_time,
        b.durationHours as duration_hours,
        b.location,
        b.type as shoot_type,
        b.status,
        b.messages as message,
        b.totalPrice as total_price,
        b.created_at,
        p.fullname as photographer_name,
        p.email as photographer_email
      FROM booking b
      LEFT JOIN users p ON b.photographerId = p.id
      WHERE b.clientId = ${clientId}`
    );

    const bookingList = Array.isArray(rows)
      ? rows.map((b: any) => ({
          id: String(b.id),
          client_id: String(b.client_id),
          photographer_id: String(b.photographer_id),
          start_time: b.startDate
            ? `${b.startDate}T${b.start_time || "00:00:00"}`
            : b.start_time || "",
          duration_hours: Number(b.duration_hours) || 1,
          location: b.location || "",
          shoot_type: b.shoot_type || "Photography",
          status: b.status || "pending",
          message: b.message || "",
          total_price: Number(b.total_price) || 0,
          profiles: {
            full_name: b.photographer_name || "Photographer",
          },
        }))
      : [];

    return NextResponse.json(bookingList);
  } catch (err) {
    console.error("Failed to fetch client bookings:", err);
    return NextResponse.json([]);
  }
}