/*
  Warnings:

  - You are about to drop the column `date` on the `ItineraryItem` table. All the data in the column will be lost.
  - Added the required column `datetime` to the `ItineraryItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItineraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datetime" DATETIME NOT NULL,
    "city" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "planId" TEXT NOT NULL,
    CONSTRAINT "ItineraryItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItineraryItem" ("activity", "city", "createdAt", "description", "id", "planId", "updatedAt") SELECT "activity", "city", "createdAt", "description", "id", "planId", "updatedAt" FROM "ItineraryItem";
DROP TABLE "ItineraryItem";
ALTER TABLE "new_ItineraryItem" RENAME TO "ItineraryItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
