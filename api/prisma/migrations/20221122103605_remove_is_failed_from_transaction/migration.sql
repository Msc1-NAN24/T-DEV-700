/*
  Warnings:

  - You are about to drop the column `is_failed` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "is_failed";
