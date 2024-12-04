/*
  Warnings:

  - You are about to drop the column `excludedTypes` on the `SearchQuery` table. All the data in the column will be lost.
  - You are about to drop the column `radius` on the `SearchQuery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SearchQuery" DROP COLUMN "excludedTypes",
DROP COLUMN "radius";
