/*
  Warnings:

  - The `destination` column on the `PopularDestinations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PopularDestinations" DROP COLUMN "destination",
ADD COLUMN     "destination" TEXT[];
