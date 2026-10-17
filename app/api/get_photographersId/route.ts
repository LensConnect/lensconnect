import {NextRequest,NextResponse} from 'next/server'
import {sql} from 'drizzle-orm'
import {db} from '@/app/src'

function parseSpecialties(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((specialty): specialty is string => typeof specialty === 'string');
    }

    if (typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((specialty): specialty is string => typeof specialty === 'string')
            : [];
    } catch {
        return [];
    }
}


export async function GET(req:NextRequest) {

    const {searchParams} = new URL(req.url);
    const id = searchParams.get('id');
    

    try{
        const profileId = Number(id);
        if(!id || !Number.isSafeInteger(profileId) || profileId <= 0){
            return NextResponse.json(
                {error:'A valid photographer profile id is required', status:400, success:false},
                {status:400}
            );
        }


        const [data] = await db.execute(sql`
            SELECT photographer_profiles.*, profiles.website AS website
            FROM photographer_profiles
            LEFT JOIN profiles ON profiles.userId = photographer_profiles.userId
            WHERE photographer_profiles.id = ${profileId}
            LIMIT 1
        `);
        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                {data:[], error:'Photographer profile not found', status:404, success:false},
                {status:404}
            );
        }
        const normalizedData = data.map((profile) => ({
                ...profile,
                specialties: parseSpecialties(profile.specialties),
            }));

        return NextResponse.json({data: normalizedData , error:'' ,status:200 , success:true});


    }
    catch(err){
        console.error('Failed to fetch photographer profile:', err);
        return NextResponse.json({error:'Failed to fetch photographer',status:500, success:false}, {status:500});
    }
}