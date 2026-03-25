-- CreateTable
CREATE TABLE "SellerWithdrawalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "topsetAccountName" TEXT,
    "pickupLocation" TEXT,
    "comment" TEXT,
    "processedAt" DATETIME,
    "processedByAdminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerWithdrawalRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SellerWithdrawalRequest_processedByAdminId_fkey" FOREIGN KEY ("processedByAdminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "deliveryMethod" TEXT,
    "city" TEXT,
    "street" TEXT,
    "house" TEXT,
    "apartment" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("apartment", "city", "comment", "createdAt", "deliveryMethod", "fullName", "house", "id", "phone", "status", "street", "total", "updatedAt", "userId") SELECT "apartment", "city", "comment", "createdAt", "deliveryMethod", "fullName", "house", "id", "phone", "status", "street", "total", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_sellerId_createdAt_idx" ON "Order"("sellerId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SellerWithdrawalRequest_sellerId_idx" ON "SellerWithdrawalRequest"("sellerId");

-- CreateIndex
CREATE INDEX "SellerWithdrawalRequest_status_idx" ON "SellerWithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "SellerWithdrawalRequest_createdAt_idx" ON "SellerWithdrawalRequest"("createdAt");
