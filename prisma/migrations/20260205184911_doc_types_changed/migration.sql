/*
  Warnings:

  - Made the column `doc_type` on table `personal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `document_types` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `personal` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `doc_type` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `personal` ADD CONSTRAINT `personal_doc_type_fkey` FOREIGN KEY (`doc_type`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
