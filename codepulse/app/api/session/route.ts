import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Helper function to calculate working hours overlap (9 AM to 5 PM)
function calculateWorkingHoursMinutes(start: Date, end: Date): number {
  const workingStartHour = 9;
  const workingEndHour = 17;

  let totalMinutes = 0;
  const current = new Date(start);

  while (current < end) {
    const hour = current.getHours();
    if (hour >= workingStartHour && hour < workingEndHour) {
      totalMinutes++;
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return totalMinutes;
}

// POST: Store a new session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      startTime,
      endTime,
      wasInterrupted,
      tabSwitchCount,
      suggestion,
      duration,
    } = body;

    const userInDb = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!userInDb) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: userInDb.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000),
        wasInterrupted,
        tabSwitchCount,
        suggestion,
      },
    });

    return NextResponse.json({
      message: 'Session stored successfully',
      focusSession,
    });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

// GET: Fetch all sessions & aggregate chart data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userInDb = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!userInDb) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: userInDb.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const groupedDaily: { [key: string]: number } = {};
    const groupedMonthly: { [key: string]: number } = {};
    const groupedYearly: { [key: string]: number } = {};

    sessions.forEach((session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);

      const focusMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      // Grouping keys
      const dailyKey = start.toLocaleDateString('en-GB'); // 01/08/2025
      const monthlyKey = `${start.getMonth() + 1}/${start.getFullYear()}`; // 8/2025
      const yearlyKey = `${start.getFullYear()}`; // 2025

      // Accumulate durations
      groupedDaily[dailyKey] = (groupedDaily[dailyKey] || 0) + focusMinutes;
      groupedMonthly[monthlyKey] = (groupedMonthly[monthlyKey] || 0) + focusMinutes;
      groupedYearly[yearlyKey] = (groupedYearly[yearlyKey] || 0) + focusMinutes;
    });

    // Convert to array format expected by the dashboard
    const dailyData = Object.entries(groupedDaily).map(([label, focusMinutes]) => ({
      label,
      focusMinutes: Math.round(focusMinutes),
    }));

    const monthlyData = Object.entries(groupedMonthly).map(([label, focusMinutes]) => ({
      label,
      focusMinutes: Math.round(focusMinutes),
    }));

    const yearlyData = Object.entries(groupedYearly).map(([label, focusMinutes]) => ({
      label,
      focusMinutes: Math.round(focusMinutes),
    }));

    // Calculate working hours data for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Filter today's sessions
    const todaySessions = sessions.filter((session) => {
      const sessionStart = new Date(session.startTime);
      return sessionStart >= startOfDay && sessionStart <= endOfDay;
    });

    // Create hourly data structure (9 AM to 5 PM = working hours)
    const workingHoursData = [];
    
    for (let hour = 9; hour <= 17; hour++) {
      const timeLabel = `${hour}:00`;
      let totalMinutes = 0;

      // Calculate focus time for this hour
      todaySessions.forEach((session) => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        
        // Check if session overlaps with this hour
        const hourStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, 0, 0);
        const hourEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour + 1, 0, 0);
        
        // Calculate overlap
        const overlapStart = new Date(Math.max(sessionStart.getTime(), hourStart.getTime()));
        const overlapEnd = new Date(Math.min(sessionEnd.getTime(), hourEnd.getTime()));
        
        if (overlapStart < overlapEnd) {
          const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / 1000 / 60;
          totalMinutes += overlapMinutes;
        }
      });

      workingHoursData.push({
        time: timeLabel,
        hours: Math.round((totalMinutes / 60) * 100) / 100, // Convert to hours with 2 decimal places
      });
    }

    console.log("Fetched sessions:", sessions.length);
    console.log("Daily data:", dailyData);
    console.log("Monthly data:", monthlyData);
    console.log("Working hours data:", workingHoursData);

    return NextResponse.json({
      sessions,
      dailyData,
      monthlyData,
      yearlyData,
      workingHoursData,
      todaySessionsCount: todaySessions.length,
    });
  } catch (error) {
    console.error('Error retrieving sessions:', error);
    return NextResponse.json({ error: 'Failed to retrieve sessions' }, { status: 500 });
  }
}
