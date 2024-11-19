/*
  Warnings:

  - The `location` column on the `Activity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `locations` on the `DailyTrip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "location",
ADD COLUMN     "location" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "DailyTrip" DROP COLUMN "locations";
