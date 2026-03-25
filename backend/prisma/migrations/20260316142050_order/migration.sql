-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" REAL NOT NULL DEFAULT 0,
    "fullName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "street" TEXT,
    "house" TEXT,
    "fullAddress" TEXT,
    "comment" TEXT,
    "deliveryMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "city", "comment", "createdAt", "deliveryMethod", "fullAddress", "fullName", "house", "id", "phone", "status", "street", "total", "updatedAt", "userId") SELECT "address", "city", "comment", "createdAt", "deliveryMethod", "fullAddress", "fullName", "house", "id", "phone", "status", "street", coalesce("total", 0) AS "total", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
