/*
  Warnings:

  - Added the required column `middleName` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profile` ADD COLUMN `middleName` VARCHAR(191) NOT NULL;
