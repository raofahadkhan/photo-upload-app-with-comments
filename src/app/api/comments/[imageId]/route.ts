 // app/api/comments/[imageId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  imageId: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const { imageId } = params;

  if (!imageId || isNaN(Number(imageId))) {
    return NextResponse.json({ error: 'Invalid image ID.' }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { imageId: Number(imageId) },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch comments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const { imageId } = params;

  if (!imageId || isNaN(Number(imageId))) {
    return NextResponse.json({ error: 'Invalid image ID.' }, { status: 400 });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required and must be a string.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        image: { connect: { id: Number(imageId) } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add comment.' }, { status: 500 });
  }
}
