-- DropForeignKey
ALTER TABLE `app_usage_logs` DROP FOREIGN KEY `app_usage_logs_computer_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_programation_id_fkey`;

-- DropForeignKey
ALTER TABLE `state_logs` DROP FOREIGN KEY `state_logs_computer_id_fkey`;

-- AlterTable
ALTER TABLE `app_usage_logs` MODIFY `computer_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `state_logs` MODIFY `computer_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_computer_id_fkey` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_usage_logs` ADD CONSTRAINT `app_usage_logs_computer_id_fkey` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_programation_id_fkey` FOREIGN KEY (`programation_id`) REFERENCES `programation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
