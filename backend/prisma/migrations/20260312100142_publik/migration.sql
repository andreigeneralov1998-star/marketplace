/*
  Warnings:

  - A unique constraint covering the columns `[storeSlug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "storeDescription" TEXT;
ALTER TABLE "User" ADD COLUMN "storeLogo" TEXT;
ALTER TABLE "User" ADD COLUMN "storeName" TEXT;
ALTER TABLE "User" ADD COLUMN "storeSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_storeSlug_key" ON "User"("storeSlug");
