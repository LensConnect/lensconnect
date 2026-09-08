import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/app/src'
import { sql, eq } from 'drizzle-orm'
import { photographer_profiles, users, profiles } from '@/app/src/db/schema'


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      userId,
      fullname,
      email,
      role,
      phoneNumber,
      hourlyRate,
      experience,
      specialties,
      bio,
      availability,
      location,
    } = body

    // Validate required fields explicitly
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    await db.insert(photographer_profiles).values({
      userId: Number(userId),
      fullname,
      email,
      role,
      phoneNumber: phoneNumber || null,
      bio: bio || null,
      location: location || null,
      experience: Number(experience) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      specialties: specialties || [],
      availability: availability ?? true,
      portfolio_image_url: [], // explicit default
    })

    return NextResponse.json(
      { message: 'Profile created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Profile creation error:', error)
    const message = error instanceof Error ? error.message : 'Profile creation failed'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUserId = searchParams.get('userId')

    // 1. Defend against missing or empty userId query parameter
    if (!rawUserId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const targetUserId = Number(rawUserId)

    // 2. Fetch Photographer using unified Drizzle v2 functional API style
    const photographer = await db.query.users.findFirst({
    where: {
        id: targetUserId,
        role: 'photographer',
      },
      with: {
        photographer_profiles: true,
        profiles: true,
      },
    });

    if (photographer) {
      // Drizzle v2 handles 1-to-1 relationships safely; fallbacks kept for safety
      const pp = Array.isArray(photographer.photographer_profiles) 
        ? photographer.photographer_profiles[0] 
        : photographer.photographer_profiles;

      const p = Array.isArray(photographer.profiles) 
        ? photographer.profiles[0] 
        : photographer.profiles;

      // Extract portfolio URL safely from stringified or direct JSON structures
      let portfolioUrl = '';
      if (pp?.portfolio_image_url) {
        const images = typeof pp.portfolio_image_url === 'string' 
          ? JSON.parse(pp.portfolio_image_url) 
          : pp.portfolio_image_url;
        if (Array.isArray(images) && images.length > 0) {
          portfolioUrl = images[0];
        }
      }
      
      return NextResponse.json({
        result: {
          id: photographer.id,
          fullname: pp?.fullname || photographer.fullname,
          email: pp?.email || photographer.email,
          role: photographer.role,
          phoneNumber: pp?.phoneNumber || p?.phoneNumber || '',
          bio: pp?.bio || p?.bio || '',
          location: pp?.location || p?.location || '',
          hourly_rate: pp?.hourlyRate || 0,
          experience: pp?.experience || 0,
          specialties: pp?.specialties || [],
          portfolio_url: portfolioUrl,
          profile_image_url: p?.imageUrl || '',
          website: p?.website || '',
        }
      }, { status: 200 })
    }

    // 3. Fetch Client directly from users table
    const client = await db.query.users.findFirst({
      where: {
        id: targetUserId,
        role: 'client',
      },
    });

    if (client) {
      return NextResponse.json({
        result: {
          id: client.id,
          fullname: client.fullname,
          email: client.email,
          role: client.role,
          phoneNumber: client.phoneNumber || '',
          bio: client.bio || '',
          location: client.location || '',
          website: client.website || '',
          imageUrl: client.profile_image_url || '',
          profile_image_url: client.profile_image_url || '',
        }
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}




export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, ...fieldsToUpdate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUserId = Number(userId);

    const userResult = await db.query.users.findFirst({
      where: { id: targetUserId },
      columns: { role: true },
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbRole = userResult.role;

    if (dbRole === 'photographer') {
      const allowedFields = [
        'fullname', 'email', 'phoneNumber', 'bio', 'location',
        'experience', 'hourlyRate', 'specialties', 'availability',
        'portfolio_image_url', 'profile_image_url'
      ];

      const sanitizedUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        if (allowedFields.includes(key)) {
          if (key === 'experience' || key === 'hourlyRate') {
            sanitizedUpdates[key] = value === '' || value === undefined || value === null ? 0 : Number(value);
          } else if (key === 'availability') {
            sanitizedUpdates[key] = Boolean(value);
          } else if (key === 'specialties') {
            sanitizedUpdates[key] = Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([]);
          } else {
            sanitizedUpdates[key] = value;
          }
        }
      }

      if (Object.keys(sanitizedUpdates).length === 0) {
        return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
      }

      const photoUpdates: Record<string, any> = {};
      const profileUpdates: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(sanitizedUpdates)) {
        if (key === 'fullname' || key === 'email') continue;
        if (key === 'profile_image_url') {
          photoUpdates[key] = value;
          profileUpdates['imageUrl'] = value;
        } else {
          photoUpdates[key] = value;
        }
      }

      if (Object.keys(photoUpdates).length > 0) {
        const existing = await db.query.photographer_profiles.findFirst({
          where: { userId: targetUserId }
        });
        if (!existing) {
          const userInfo = await db.query.users.findFirst({
            where: { id: targetUserId },
            columns: { fullname: true, email: true, role: true },
          });
          await db.insert(photographer_profiles).values({
            userId: targetUserId,
            fullname: userInfo?.fullname || '',
            email: userInfo?.email || '',
            role: 'photographer',
            experience: photoUpdates.experience ?? 0,
            hourlyRate: photoUpdates.hourlyRate ?? 0,
            specialties: photoUpdates.specialties ?? [],
            availability: photoUpdates.availability ?? true,
            ...photoUpdates,
          });
        } else {
          await db.update(photographer_profiles).set(photoUpdates).where(eq(photographer_profiles.userId, targetUserId));
        }
      }

      if (Object.keys(profileUpdates).length > 0) {
        const existing = await db.query.profiles.findFirst({
          where: { userId: targetUserId }
        });
        if (!existing) {
          await db.insert(profiles).values({ userId: targetUserId, ...profileUpdates });
        } else {
          await db.update(profiles).set(profileUpdates).where(eq(profiles.userId, targetUserId));
        }
      }

      if (sanitizedUpdates.fullname || sanitizedUpdates.email) {
        const userUpdates: Record<string, any> = {};
        if (sanitizedUpdates.fullname) userUpdates.fullname = sanitizedUpdates.fullname;
        if (sanitizedUpdates.email) userUpdates.email = sanitizedUpdates.email;
        await db.update(users).set(userUpdates).where(eq(users.id, targetUserId));
      }

    } else {
      const allowedFields = [
        'fullname', 'phoneNumber', 'bio', 'website', 'location', 'profile_image_url', 'imageUrl'
      ];

      const sanitizedUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        if (allowedFields.includes(key)) {
          if (key === 'imageUrl') {
            sanitizedUpdates['profile_image_url'] = value;
          } else {
            sanitizedUpdates[key] = value;
          }
        }
      }

      if (Object.keys(sanitizedUpdates).length === 0) {
        return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
      }

      await db.update(users).set(sanitizedUpdates).where(eq(users.id, targetUserId));
    }

    return NextResponse.json({
      message: 'Profile updated successfully ',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}