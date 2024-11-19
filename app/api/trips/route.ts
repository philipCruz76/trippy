import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ActivityType, DailyActivitesType } from "@/types/trip.types";

type PostBody = {
  title: string;
  location: string;
  duration: number;
  itinerary:
    | {
        title?: string;
        days?: DailyActivitesType[];
        comment?: string;
      }
    | undefined;
};

export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const { title, location, duration, itinerary } = body as PostBody;
  
      const tripDetails = await db.tripDetails.create({
        data: {
          title,
          location,
          duration,
          username: session.user.username || 'Anonymous',
          userId: session.user.id,
          coverPhoto: "https://images.unsplash.com/photo-1583295125721-766a0088cd3f?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          overview: {
            create: {
              summary: "",
              activityTypes: []
            }
          },
          itinerary: {
            create: {
              title: itinerary?.title || "",
              dailyTrip: {
                create: itinerary?.days?.map((day, index) => ({
                  dayNumber: index + 1,
                  title: `Day ${index + 1}`,
                  overview: {
                    summary: "",
                    activityTypes: [],
                    destinations: []
                  },
                  activities: {
                    create: day.dailyActivities.map((activity: ActivityType) => ({
                      placeId: activity.id,
                      activityName: activity.title,
                      summary: "",
                      photos: activity.cover ? [activity.cover] : [],
                      location: {
                        lat: activity.location.lat,
                        lng: activity.location.lng,
                      },
                      activityType: activity.activityType,
                      time: `${activity.durationFrom}-${activity.durationTo}`
                    }))
                  }
                }))
              }
            }
          }
        }
      });
  
      return NextResponse.json(tripDetails);
    } catch (error) {
      console.error('Error creating trip:', error);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }
  }