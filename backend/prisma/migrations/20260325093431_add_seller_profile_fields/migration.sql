-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'BUYER',
    "isSellerApproved" BOOLEAN NOT NULL DEFAULT false,
    "storeName" TEXT,
    "storeSlug" TEXT,
    "storeDescription" TEXT,
    "storeLogo" TEXT,
    "lastName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "warehouseAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("city", "createdAt", "email", "firstName", "fullName", "id", "isSellerApproved", "lastName", "middleName", "passwordHash", "phone", "role", "storeDescription", "storeLogo", "storeName", "storeSlug", "updatedAt", "username", "warehouseAddress") SELECT "city", "createdAt", "email", "firstName", "fullName", "id", "isSellerApproved", "lastName", "middleName", "passwordHash", "phone", "role", "storeDescription", "storeLogo", "storeName", "storeSlug", "updatedAt", "username", "warehouseAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_storeSlug_key" ON "User"("storeSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
