-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('SCREENSHOT', 'ARTWORK', 'COVER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GUEST');

-- CreateTable
CREATE TABLE "CachedGame" (
    "id" SERIAL NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "summary" TEXT,
    "storyline" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "firstReleaseDate" TIMESTAMP(3),
    "category" INTEGER,
    "status" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedGenre" (
    "id" SERIAL NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedPlatform" (
    "id" SERIAL NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "abbreviation" TEXT,
    "url" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedTheme" (
    "id" SERIAL NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedImage" (
    "id" SERIAL NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "imageId" TEXT,
    "type" "ImageType" NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedGameGenre" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "CachedGameGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedGamePlatform" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,

    CONSTRAINT "CachedGamePlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedGameTheme" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "CachedGameTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedScreenshot" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "CachedScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedArtwork" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "CachedArtwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedCover" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "CachedCover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchCache" (
    "id" SERIAL NOT NULL,
    "queryHash" TEXT NOT NULL,
    "queryParams" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "ttl" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEmail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedGame_igdbId_key" ON "CachedGame"("igdbId");

-- CreateIndex
CREATE INDEX "CachedGame_igdbId_idx" ON "CachedGame"("igdbId");

-- CreateIndex
CREATE INDEX "CachedGame_name_idx" ON "CachedGame"("name");

-- CreateIndex
CREATE INDEX "CachedGame_rating_idx" ON "CachedGame"("rating");

-- CreateIndex
CREATE INDEX "CachedGame_firstReleaseDate_idx" ON "CachedGame"("firstReleaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "CachedGenre_igdbId_key" ON "CachedGenre"("igdbId");

-- CreateIndex
CREATE INDEX "CachedGenre_igdbId_idx" ON "CachedGenre"("igdbId");

-- CreateIndex
CREATE INDEX "CachedGenre_name_idx" ON "CachedGenre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CachedPlatform_igdbId_key" ON "CachedPlatform"("igdbId");

-- CreateIndex
CREATE INDEX "CachedPlatform_igdbId_idx" ON "CachedPlatform"("igdbId");

-- CreateIndex
CREATE INDEX "CachedPlatform_name_idx" ON "CachedPlatform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CachedTheme_igdbId_key" ON "CachedTheme"("igdbId");

-- CreateIndex
CREATE INDEX "CachedTheme_igdbId_idx" ON "CachedTheme"("igdbId");

-- CreateIndex
CREATE INDEX "CachedTheme_name_idx" ON "CachedTheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CachedImage_igdbId_key" ON "CachedImage"("igdbId");

-- CreateIndex
CREATE INDEX "CachedImage_igdbId_idx" ON "CachedImage"("igdbId");

-- CreateIndex
CREATE INDEX "CachedImage_type_idx" ON "CachedImage"("type");

-- CreateIndex
CREATE INDEX "CachedGameGenre_gameId_idx" ON "CachedGameGenre"("gameId");

-- CreateIndex
CREATE INDEX "CachedGameGenre_genreId_idx" ON "CachedGameGenre"("genreId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedGameGenre_gameId_genreId_key" ON "CachedGameGenre"("gameId", "genreId");

-- CreateIndex
CREATE INDEX "CachedGamePlatform_gameId_idx" ON "CachedGamePlatform"("gameId");

-- CreateIndex
CREATE INDEX "CachedGamePlatform_platformId_idx" ON "CachedGamePlatform"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedGamePlatform_gameId_platformId_key" ON "CachedGamePlatform"("gameId", "platformId");

-- CreateIndex
CREATE INDEX "CachedGameTheme_gameId_idx" ON "CachedGameTheme"("gameId");

-- CreateIndex
CREATE INDEX "CachedGameTheme_themeId_idx" ON "CachedGameTheme"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedGameTheme_gameId_themeId_key" ON "CachedGameTheme"("gameId", "themeId");

-- CreateIndex
CREATE INDEX "CachedScreenshot_gameId_idx" ON "CachedScreenshot"("gameId");

-- CreateIndex
CREATE INDEX "CachedScreenshot_imageId_idx" ON "CachedScreenshot"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedScreenshot_gameId_imageId_key" ON "CachedScreenshot"("gameId", "imageId");

-- CreateIndex
CREATE INDEX "CachedArtwork_gameId_idx" ON "CachedArtwork"("gameId");

-- CreateIndex
CREATE INDEX "CachedArtwork_imageId_idx" ON "CachedArtwork"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedArtwork_gameId_imageId_key" ON "CachedArtwork"("gameId", "imageId");

-- CreateIndex
CREATE INDEX "CachedCover_gameId_idx" ON "CachedCover"("gameId");

-- CreateIndex
CREATE INDEX "CachedCover_imageId_idx" ON "CachedCover"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedCover_gameId_imageId_key" ON "CachedCover"("gameId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchCache_queryHash_key" ON "SearchCache"("queryHash");

-- CreateIndex
CREATE INDEX "SearchCache_queryHash_idx" ON "SearchCache"("queryHash");

-- CreateIndex
CREATE INDEX "SearchCache_ttl_idx" ON "SearchCache"("ttl");

-- CreateIndex
CREATE INDEX "ApiUsage_endpoint_idx" ON "ApiUsage"("endpoint");

-- CreateIndex
CREATE INDEX "ApiUsage_timestamp_idx" ON "ApiUsage"("timestamp");

-- CreateIndex
CREATE INDEX "ApiUsage_statusCode_idx" ON "ApiUsage"("statusCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEmail_email_key" ON "WaitlistEmail"("email");

-- CreateIndex
CREATE INDEX "WaitlistEmail_email_idx" ON "WaitlistEmail"("email");

-- CreateIndex
CREATE INDEX "WaitlistEmail_notified_idx" ON "WaitlistEmail"("notified");

-- CreateIndex
CREATE INDEX "WaitlistEmail_createdAt_idx" ON "WaitlistEmail"("createdAt");

-- AddForeignKey
ALTER TABLE "CachedGameGenre" ADD CONSTRAINT "CachedGameGenre_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedGameGenre" ADD CONSTRAINT "CachedGameGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "CachedGenre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedGamePlatform" ADD CONSTRAINT "CachedGamePlatform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedGamePlatform" ADD CONSTRAINT "CachedGamePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "CachedPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedGameTheme" ADD CONSTRAINT "CachedGameTheme_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedGameTheme" ADD CONSTRAINT "CachedGameTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "CachedTheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedScreenshot" ADD CONSTRAINT "CachedScreenshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedScreenshot" ADD CONSTRAINT "CachedScreenshot_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CachedImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedArtwork" ADD CONSTRAINT "CachedArtwork_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedArtwork" ADD CONSTRAINT "CachedArtwork_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CachedImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedCover" ADD CONSTRAINT "CachedCover_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "CachedGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedCover" ADD CONSTRAINT "CachedCover_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CachedImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
