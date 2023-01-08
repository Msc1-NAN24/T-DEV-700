/*
  Warnings:

  - Made the column `cheque_uuid` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "cheque_uuid" SET NOT NULL;
