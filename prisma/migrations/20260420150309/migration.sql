/*
  Warnings:

  - You are about to drop the column `group` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `group_name` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appuser` DROP FOREIGN KEY `appuser_group_fkey`;

-- DropIndex
DROP INDEX `appuser_group_idx` ON `appuser`;

-- DropIndex
DROP INDEX `groups_group_name_key` ON `groups`;

-- AlterTable
ALTER TABLE `appuser` DROP COLUMN `group`,
    ADD COLUMN `group_id` INTEGER NULL,
    ADD COLUMN `role_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `groups` DROP COLUMN `group_name`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `access_level_id` INTEGER NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NULL,
    `access_to` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `appuser_group_id_idx` ON `appuser`(`group_id`);

-- CreateIndex
CREATE INDEX `appuser_role_id_idx` ON `appuser`(`role_id`);

-- CreateIndex
CREATE UNIQUE INDEX `groups_name_key` ON `groups`(`name`);

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_access_level_id_fkey` FOREIGN KEY (`access_level_id`) REFERENCES `access_levels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appuser` ADD CONSTRAINT `appuser_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appuser` ADD CONSTRAINT `appuser_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
