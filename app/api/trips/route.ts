import { NextResponse } from "next/server";
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
      const body = await request.json();
      const { title, location, duration, itinerary } = body as PostBody;
  
      const tripDetails = await db.tripDetails.create({
        data: {
          title,
          location,
          duration,
          username: "Test User",
          userId: "thisisatestid",
          coverPhoto: "https://images.unsplash.com/photo-1684419432137-f35689916e1a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UE9ydG98ZW58MHwxfDB8fHwy",
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