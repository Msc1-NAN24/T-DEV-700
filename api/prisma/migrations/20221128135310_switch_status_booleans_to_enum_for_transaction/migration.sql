/*
  Warnings:

  - You are about to drop the column `is_overdraft` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `is_refused` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `is_successful` on the `Transaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'OVERDRAFT', 'REFUSED');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "is_overdraft",
DROP COLUMN "is_refused",
DROP COLUMN "is_successful",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';
