/*
  Warnings:

  - You are about to drop the `access_levels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `access_level` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_access_level_id_fkey`;

-- DropIndex
DROP INDEX `roles_access_level_id_fkey` ON `roles`;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `access_level` JSON NOT NULL;

-- DropTable
DROP TABLE `access_levels`;
