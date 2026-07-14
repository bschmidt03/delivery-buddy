-- CreateTable
CREATE TABLE "Bathroom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "accessible" BOOLEAN NOT NULL DEFAULT false,
    "requiresCode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stars" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bathroomId" TEXT NOT NULL,
    CONSTRAINT "Rating_bathroomId_fkey" FOREIGN KEY ("bathroomId") REFERENCES "Bathroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
