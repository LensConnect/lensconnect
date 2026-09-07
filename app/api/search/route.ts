import { db } from '@/app/src'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { parseNaturalLanguageQuery } from '@/lib/aiSearchParser';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userNaturalLanguagePrompt } = body;

    // 1. Fetch filters securely from our clean utility
    const filters = await parseNaturalLanguageQuery(userNaturalLanguagePrompt);

    if (!filters) {
      return NextResponse.json({ success: false, error: 'Failed to process query' }, { status: 400 });
    }

    const whereClauses = [];

    // 2. Keyword/Bio Mapping
    if (filters.searchQuery) {
      whereClauses.push(sql`(fullname LIKE ${`%${filters.searchQuery}%`} OR bio LIKE ${`%${filters.searchQuery}%`})`);
    }

    // 3. Location Checking
    if (filters.location) {
      whereClauses.push(sql`location LIKE ${`%${filters.location}%`}`);
    }

    // 4. Specialties Array Evaluation for MySQL
    if (filters.selectedSpecialties && filters.selectedSpecialties.length > 0) {
      const specialtyConditions = filters.selectedSpecialties.map(
        (spec: any) => sql`JSON_CONTAINS(specialties, JSON_QUOTE(${spec}))`
      );
      whereClauses.push(sql.join(specialtyConditions, sql` OR `));
    }

    // 5. Budget Constraints (Mapping to hourly_rate)
    if (filters.minPrice) {
      whereClauses.push(sql`hourlyRate >= ${filters.minPrice}`);
    }

    if (filters.maxPrice) {
      whereClauses.push(sql`hourlyRate <= ${filters.maxPrice}`);
    }

    const finalWhereChunk = whereClauses.length > 0 ? sql.join(whereClauses, sql` AND `) : sql`1 = 1`;

    // 6. Safe Sorting Metric Execution (Avoiding missing rating field crash)
    let orderByChunk = sql`id DESC`; 
    if (filters.sortBy === 'price_asc') orderByChunk = sql`hourlyRate ASC`;
    if (filters.sortBy === 'price_desc') orderByChunk = sql`hourlyRate DESC`;

    // 7. Formulate Query
    const query = sql`
      SELECT * FROM photographer_profiles 
      WHERE ${finalWhereChunk}
      ORDER BY ${orderByChunk}
    `;

    const result = await db.execute(query);
    const rawRows = (result as any).rows || result;

    // Send everything back cleanly to update both the cards and the sidebar layout filters
    return NextResponse.json({ success: true, data: rawRows, filters });

  } catch (err) {
    console.error('AI-Enhanced API Route Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
