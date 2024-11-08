-- CreateTable
CREATE TABLE "PopularDestinations" (
    "id" TEXT NOT NULL,
    "destination" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopularDestinations_pkey" PRIMARY KEY ("id")
);
