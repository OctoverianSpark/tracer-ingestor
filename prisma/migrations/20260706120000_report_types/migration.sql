-- CreateTable
CREATE TABLE `report_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `report_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_type_assignments` (
    `report_type_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,

    INDEX `report_type_assignments_group_id_idx`(`group_id`),
    PRIMARY KEY (`report_type_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `report_type_assignments` ADD CONSTRAINT `report_type_assignments_report_type_id_fkey` FOREIGN KEY (`report_type_id`) REFERENCES `report_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_type_assignments` ADD CONSTRAINT `report_type_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
