/*
  Warnings:

  - You are about to drop the column `personal_id` on the `computers` table. All the data in the column will be lost.
  - You are about to drop the column `personal_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `personal_id` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the `personal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `appuser_id` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appuser_id` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `computers` DROP FOREIGN KEY `computers_personal_id_fkey`;

-- DropForeignKey
ALTER TABLE `personal` DROP FOREIGN KEY `personal_doc_type_fkey`;

-- DropForeignKey
ALTER TABLE `personal` DROP FOREIGN KEY `personal_group_fkey`;

-- DropForeignKey
ALTER TABLE `personal` DROP FOREIGN KEY `personal_mode_type_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_personal_id_fkey`;

-- DropIndex
DROP INDEX `computers_personal_id_idx` ON `computers`;

-- DropIndex
DROP INDEX `schedules_personal_id_idx` ON `schedules`;

-- AlterTable
ALTER TABLE `computers` DROP COLUMN `personal_id`,
    ADD COLUMN `appuser_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `groups` DROP COLUMN `personal_id`,
    ADD COLUMN `appuser_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `schedules` DROP COLUMN `personal_id`,
    ADD COLUMN `appuser_id` BIGINT NOT NULL;

-- DropTable
DROP TABLE `personal`;

-- CreateTable
CREATE TABLE `appuser` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` TEXT NOT NULL,
    `doc_type` INTEGER NOT NULL,
    `document` VARCHAR(150) NULL,
    `job_title` VARCHAR(120) NULL,
    `corporative_email` VARCHAR(191) NOT NULL DEFAULT '',
    `mode_type` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `group` INTEGER NULL,

    INDEX `appuser_doc_type_mode_type_group_idx`(`doc_type`, `mode_type`, `group`),
    INDEX `appuser_type_fkey`(`mode_type`, `group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `computers_appuser_id_idx` ON `computers`(`appuser_id`);

-- CreateIndex
CREATE INDEX `schedules_appuser_id_idx` ON `schedules`(`appuser_id`);

-- AddForeignKey
ALTER TABLE `computers` ADD CONSTRAINT `computers_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appuser` ADD CONSTRAINT `appuser_doc_type_fkey` FOREIGN KEY (`doc_type`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appuser` ADD CONSTRAINT `appuser_mode_type_fkey` FOREIGN KEY (`mode_type`) REFERENCES `modes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appuser` ADD CONSTRAINT `appuser_group_fkey` FOREIGN KEY (`group`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
