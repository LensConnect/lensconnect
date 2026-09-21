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
        if(!id){
            return NextResponse.json({error:'No Photograper with this id found' , status:404 , success:false})
        }


        const [data] = await db.execute(sql`SELECT * FROM photographer_profiles WHERE userId = ${id} OR id = ${id}`);
        const normalizedData = Array.isArray(data)
            ? data.map((profile) => ({
                ...profile,
                specialties: parseSpecialties(profile.specialties),
            }))
            : data;

        return NextResponse.json({data: normalizedData , error:'' ,status:200 , success:true});


    }
    catch(err){
        return NextResponse.json({error:'Failed to fetch photographer',status:500, success:false})
    }
}