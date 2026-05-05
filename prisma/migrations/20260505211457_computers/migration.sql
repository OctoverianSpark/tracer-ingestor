-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_appuser_id_fkey`;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
