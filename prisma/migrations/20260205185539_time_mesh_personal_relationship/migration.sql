/*
  Warnings:

  - You are about to drop the column `user` on the `time_mesh` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `time_mesh` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `time_mesh` DROP COLUMN `user`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `time_mesh` ADD CONSTRAINT `time_mesh_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `personal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
