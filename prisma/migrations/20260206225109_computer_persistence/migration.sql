/*
  Warnings:

  - You are about to drop the column `uuid` on the `computers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `uuid` ON `computers`;

-- AlterTable
ALTER TABLE `computers` DROP COLUMN `uuid`;

-- CreateTable
CREATE TABLE `clients` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `machineName` VARCHAR(191) NOT NULL,
    `machineSerial` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `isAlive` BOOLEAN NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `connectedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
