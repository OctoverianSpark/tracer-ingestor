/*
  Warnings:

  - You are about to drop the column `corporative_email` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `doc_type` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `job_title` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `mode_type` on the `appuser` table. All the data in the column will be lost.
  - You are about to drop the column `appuser_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the `document_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `appuser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `appuser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appuser` DROP FOREIGN KEY `appuser_doc_type_fkey`;

-- DropForeignKey
ALTER TABLE `appuser` DROP FOREIGN KEY `appuser_mode_type_fkey`;

-- DropIndex
DROP INDEX `appuser_doc_type_mode_type_group_idx` ON `appuser`;

-- DropIndex
DROP INDEX `appuser_type_fkey` ON `appuser`;

-- AlterTable
ALTER TABLE `appuser` DROP COLUMN `corporative_email`,
    DROP COLUMN `doc_type`,
    DROP COLUMN `document`,
    DROP COLUMN `job_title`,
    DROP COLUMN `mode_type`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `groups` DROP COLUMN `appuser_id`;

-- DropTable
DROP TABLE `document_types`;

-- DropTable
DROP TABLE `modes`;

-- CreateIndex
CREATE UNIQUE INDEX `appuser_email_key` ON `appuser`(`email`);

-- RenameIndex
ALTER TABLE `appuser` RENAME INDEX `appuser_group_fkey` TO `appuser_group_idx`;
