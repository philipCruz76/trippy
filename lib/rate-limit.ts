import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import redis from './redis';


export async function rateLimiter(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const ip = req.ip ?? 'anonymous';
    const timeWindow = 60; // 1 minute in seconds
    const maxRequests = token ? 100 : 20; // Higher limit for authenticated users

    const key = `rate-limit:${ip}`;
    
    // Get the current count from Redis
    const result = await redis.get(key);
    let counter: number;
    
    if (result) {
      // Increment the existing counter
      counter = await redis.incr(key);
    } else {
      // Initialize new counter
      counter = 1;
      await redis.set(key, counter, { ex: timeWindow });
    }

    if (counter > maxRequests) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request to proceed if Redis is unavailable
    return null;
  }
}