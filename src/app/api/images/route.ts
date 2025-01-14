// app/api/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required and must be a string.' }, { status: 400 });
    }

    const image = await prisma.image.create({
      data: {
        url,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save image.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const images = await prisma.image.findMany({
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(images);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch images.' }, { status: 500 });
  }
}
