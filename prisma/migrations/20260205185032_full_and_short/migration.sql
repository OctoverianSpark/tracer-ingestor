/*
  Warnings:

  - You are about to drop the column `name` on the `document_types` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `document_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `short_name` to the `document_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document_types` DROP COLUMN `name`,
    ADD COLUMN `full_name` VARCHAR(120) NOT NULL,
    ADD COLUMN `short_name` VARCHAR(60) NOT NULL;
