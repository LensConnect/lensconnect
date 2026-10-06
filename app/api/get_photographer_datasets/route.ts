import { db } from '@/app/src'
import { NextResponse } from 'next/server'
import { photographer_datasets } from '@/app/src/db/schema'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(photographer_datasets)

    if (!Array.isArray(rows)) {
      return NextResponse.json([])
    }

    const formatted = rows.map((row) => {
      const location = [row.city, row.state, row.countryCode].filter(Boolean).join(', ')
      const rating = row.reviewsCount > 0 ? row.totalScore / row.reviewsCount : 0
      const specialties = Array.isArray(row.categories)
        ? [...row.categories, row.categoryName].filter(Boolean)
        : [row.categoryName].filter(Boolean)

      return {
        id: String(row.id),
        title: row.title || '',
        location: location || '',
        reviewsCount: row.reviewsCount || 0,
        rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0,
        specialties,
        website: row.website || '',
        phone: row.phone || '',
        url: row.url || '',
        street: row.street || '',
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching photographer datasets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photographers' },
      { status: 500 }
    )
  }
}