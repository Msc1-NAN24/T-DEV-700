/*
  Warnings:

  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "type",
ADD COLUMN     "is_failed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_overdraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_refused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_successful" BOOLEAN NOT NULL DEFAULT false;
