-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "datastoreName" TEXT NOT NULL,
    "datastoreType" TEXT NOT NULL,
    "keyPattern" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    CONSTRAINT "Rule_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rule" ("datastoreName", "datastoreType", "gameId", "id", "keyPattern", "label", "scope") SELECT "datastoreName", "datastoreType", "gameId", "id", "keyPattern", "label", "scope" FROM "Rule";
DROP TABLE "Rule";
ALTER TABLE "new_Rule" RENAME TO "Rule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
