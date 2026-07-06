-- CreateTable
CREATE TABLE `reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_type_id` INTEGER NOT NULL,
    `computer_id` BIGINT NULL,
    `appuser_id` BIGINT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reports_report_type_id_idx`(`report_type_id`),
    INDEX `reports_computer_id_idx`(`computer_id`),
    INDEX `reports_appuser_id_idx`(`appuser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_report_type_id_fkey` FOREIGN KEY (`report_type_id`) REFERENCES `report_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_computer_id_fkey` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
