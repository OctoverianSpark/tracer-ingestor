/*
  Warnings:

  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `clients` DROP FOREIGN KEY `clients_computer_id_fkey`;

-- DropTable
DROP TABLE `clients`;
