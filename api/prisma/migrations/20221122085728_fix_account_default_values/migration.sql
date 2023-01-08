/*
  Warnings:

  - You are about to drop the column `ceilint` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "ceilint",
ADD COLUMN     "ceiling" INTEGER NOT NULL DEFAULT 100,
ALTER COLUMN "credit_card" DROP NOT NULL,
ALTER COLUMN "cheque_uuid" DROP NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "max_overdraft" SET DEFAULT 0;

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "sender_id" TEXT,
    "receiver_id" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
