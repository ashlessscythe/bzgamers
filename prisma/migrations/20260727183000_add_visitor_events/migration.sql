-- CreateTable
CREATE TABLE "VisitorEvent" (
    "id" SERIAL NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" INTEGER,
    "eventType" TEXT NOT NULL,
    "searchQuery" TEXT,
    "mood" TEXT,
    "moodLabel" TEXT,
    "timeAvailable" TEXT,
    "timeLabel" TEXT,
    "genre" TEXT,
    "genreLabel" TEXT,
    "gameId" INTEGER,
    "gameName" TEXT,
    "resultCount" INTEGER,
    "metadata" JSONB,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorEvent_eventType_idx" ON "VisitorEvent"("eventType");

-- CreateIndex
CREATE INDEX "VisitorEvent_visitorId_idx" ON "VisitorEvent"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorEvent_userId_idx" ON "VisitorEvent"("userId");

-- CreateIndex
CREATE INDEX "VisitorEvent_createdAt_idx" ON "VisitorEvent"("createdAt");

-- CreateIndex
CREATE INDEX "VisitorEvent_mood_idx" ON "VisitorEvent"("mood");

-- CreateIndex
CREATE INDEX "VisitorEvent_moodLabel_idx" ON "VisitorEvent"("moodLabel");

-- CreateIndex
CREATE INDEX "VisitorEvent_searchQuery_idx" ON "VisitorEvent"("searchQuery");

-- CreateIndex
CREATE INDEX "VisitorEvent_gameId_idx" ON "VisitorEvent"("gameId");

-- AddForeignKey
ALTER TABLE "VisitorEvent" ADD CONSTRAINT "VisitorEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
