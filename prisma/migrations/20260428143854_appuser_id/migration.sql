-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_appuser_id_fkey`;

-- AlterTable
ALTER TABLE `schedules` MODIFY `appuser_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
