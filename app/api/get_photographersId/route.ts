import {NextRequest,NextResponse} from 'next/server'
import {sql} from 'drizzle-orm'
import {db} from '@/app/src'
import { error } from 'console';


export async function GET(req:NextRequest) {

    const {searchParams} = new URL(req.url);
    const id = searchParams.get('id');
    

    try{
        if(!id){
            return NextResponse.json({error:'No Photograper with this id found' , status:404 , success:false})
        }


        const [data] = await db.execute(sql`SELECT * FROM photographer_profiles WHERE userId = ${id} OR id = ${id}`);

        return NextResponse.json({data , error:'' ,status:200 , success:true});


    }
    catch(err){
        return NextResponse.json({error:'Failed to fetch photographer',status:500, success:false})
    }
}