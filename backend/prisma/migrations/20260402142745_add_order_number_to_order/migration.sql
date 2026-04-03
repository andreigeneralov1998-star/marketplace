/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[requestNumber]` on the table `SellerWithdrawalRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

-- AlterTable
ALTER TABLE "SellerWithdrawalRequest" ADD COLUMN "requestNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SellerWithdrawalRequest_requestNumber_key" ON "SellerWithdrawalRequest"("requestNumber");
