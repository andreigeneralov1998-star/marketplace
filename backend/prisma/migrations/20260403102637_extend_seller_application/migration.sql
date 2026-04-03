/*
  Warnings:

  - Added the required column `city` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseAddress` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SellerApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "warehouseAddress" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "storeDescription" TEXT,
    "storeLogo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerApplication" ("createdAt", "id", "status", "storeDescription", "storeLogo", "storeName", "storeSlug", "updatedAt", "userId") SELECT "createdAt", "id", "status", "storeDescription", "storeLogo", "storeName", "storeSlug", "updatedAt", "userId" FROM "SellerApplication";
DROP TABLE "SellerApplication";
ALTER TABLE "new_SellerApplication" RENAME TO "SellerApplication";
CREATE UNIQUE INDEX "SellerApplication_userId_key" ON "SellerApplication"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
