import { db } from '@/app/src'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

// 1. Unified TypeScript structure matching your database fields
interface PhotographerRow {
    id: number;
    userId: number;
    fullname: string;
    location: string | null;
    bio: string | null;
    hourlyRate: number;
    specialties: string | string[]; // MySQL JSON fields can return as strings or parsed arrays
    role: string;
    profile_image_url: string;
    availability: boolean | number;
}

function parseSpecialties(value: PhotographerRow["specialties"]): string[] {
    if (Array.isArray(value)) return value;

    let parsed: unknown = value;
    for (let attempt = 0; attempt < 2 && typeof parsed === "string"; attempt++) {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return [];
        }
    }

    return Array.isArray(parsed) ? parsed : [];
}

export async function GET(req: NextRequest) {
    try {
        // 2. Fetch all required fields directly from the database string
        const [rows] = await db.execute<PhotographerRow>(sql`
             SELECT
               id,
               userId,
               fullname,
               location,
               bio,
               hourlyRate,
               specialties,
               role,
               profile_image_url,
               availability      
             FROM photographer_profiles
             WHERE role = 'photographer'
         `);

        if (!Array.isArray(rows)) {
            return NextResponse.json([]);
        }

        // 3. Clean mapping loop with correct implicit object returns
        const formattedPhotographers = rows.map((row) => ({
            id: String(row.id),
            userId: String(row.userId),
            bio: row.bio || '',
            fullname: row.fullname || '',
            hourlyRate: Number(row.hourlyRate) || 0,
            location: String(row.location) || '',
            specialties: parseSpecialties(row.specialties),
            profile_image_url: row.profile_image_url || '',
            availability: Boolean(row.availability),
            role: row.role || 'photographer',
            rating: "5.0"
     // Temporary fallback if you don't have a ratings system table yet
        }));

        return NextResponse.json(formattedPhotographers);
    } catch (error) {
        console.error('Error fetching photographers profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch photographers' }, 
            { status: 500 }
        );
    }
}
