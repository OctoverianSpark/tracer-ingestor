/*
  Warnings:

  - You are about to drop the column `access_level_id` on the `roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `roles` DROP COLUMN `access_level_id`;
