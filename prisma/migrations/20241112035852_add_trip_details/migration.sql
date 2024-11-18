/*
  Warnings:

  - You are about to drop the column `editorialSummary` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `TripActivity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dailyTripId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_chatDayId_fkey";

-- DropForeignKey
ALTER TABLE "TripActivity" DROP CONSTRAINT "TripActivity_tripDayId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "editorialSummary",
DROP COLUMN "name",
ADD COLUMN     "activityType" TEXT,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "dailyTripId" TEXT NOT NULL,
ADD COLUMN     "durationFrom" TEXT,
ADD COLUMN     "durationTo" TEXT,
ADD COLUMN     "manualInput" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "tripDayId" TEXT,
ALTER COLUMN "chatDayId" DROP NOT NULL;

-- DropTable
DROP TABLE "TripActivity";

-- CreateTable
CREATE TABLE "TripDetails" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coverPhoto" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TripDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Overview" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "Overview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTrip" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "overview" JSONB NOT NULL,
    "itineraryId" TEXT NOT NULL,

    CONSTRAINT "DailyTrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Overview_tripId_key" ON "Overview"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_tripId_key" ON "Itinerary"("tripId");

-- AddForeignKey
ALTER TABLE "TripDetails" ADD CONSTRAINT "TripDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "TripDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "TripDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTrip" ADD CONSTRAINT "DailyTrip_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_dailyTripId_fkey" FOREIGN KEY ("dailyTripId") REFERENCES "DailyTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tripDayId_fkey" FOREIGN KEY ("tripDayId") REFERENCES "TripDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_chatDayId_fkey" FOREIGN KEY ("chatDayId") REFERENCES "ChatDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
