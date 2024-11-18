/*
  Warnings:

  - You are about to drop the column `cover` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `durationFrom` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `durationTo` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `manualInput` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `Overview` table. All the data in the column will be lost.
  - Added the required column `activityName` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locations` to the `DailyTrip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityTypes` to the `Overview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_chatDayId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_tripDayId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "cover",
DROP COLUMN "durationFrom",
DROP COLUMN "durationTo",
DROP COLUMN "manualInput",
DROP COLUMN "title",
ADD COLUMN     "activityName" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "DailyTrip" ADD COLUMN     "locations" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Overview" DROP COLUMN "stats",
ADD COLUMN     "activityTypes" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tripDayId_fkey" FOREIGN KEY ("tripDayId") REFERENCES "TripDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_chatDayId_fkey" FOREIGN KEY ("chatDayId") REFERENCES "ChatDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
