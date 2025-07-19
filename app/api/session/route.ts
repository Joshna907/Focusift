import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, startTime, endTime, wasInterrupted, tabSwitchCount, suggestion } = body;

    const session = await prisma.session.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Session stored successfully', session });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
