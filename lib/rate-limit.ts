import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import redis from './redis';


export async function rateLimiter(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
    const timeWindow = 60; // 1 minute in seconds
    const maxRequests = token ? 100 : 30; // Higher limit for authenticated users

    const key = `rate-limit:${ip}`;
    
    // Use Redis MULTI to ensure atomic operations and TTL
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, timeWindow);
    
    const [counter] = (await multi.exec()) as [number];

    if (counter > maxRequests) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': timeWindow.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + timeWindow).toString()
        }
      });
    }

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request to proceed if Redis is unavailable
    return null;
  }
}