/*
  Warnings:

  - You are about to drop the column `os` on the `computers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serial_number]` on the table `computers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `computers` DROP COLUMN `os`,
    ADD COLUMN `serial_number` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `time_mesh` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateIndex
CREATE UNIQUE INDEX `computers_serial_number_key` ON `computers`(`serial_number`);
