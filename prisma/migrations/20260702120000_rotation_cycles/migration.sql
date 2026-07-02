-- CreateTable
CREATE TABLE `rotation_cycles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `appuser_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `start_date` DATE NOT NULL,
    `weeks` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `rotation_cycles_appuser_id_key`(`appuser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rotation_slots` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rotation_cycle_id` BIGINT NOT NULL,
    `week_index` INTEGER NOT NULL,
    `day_of_week` VARCHAR(20) NOT NULL,
    `programation_id` BIGINT NOT NULL,

    UNIQUE INDEX `rotation_slots_rotation_cycle_id_week_index_day_of_week_key`(`rotation_cycle_id`, `week_index`, `day_of_week`),
    INDEX `rotation_slots_programation_id_idx`(`programation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rotation_cycles` ADD CONSTRAINT `rotation_cycles_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rotation_slots` ADD CONSTRAINT `rotation_slots_rotation_cycle_id_fkey` FOREIGN KEY (`rotation_cycle_id`) REFERENCES `rotation_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rotation_slots` ADD CONSTRAINT `rotation_slots_programation_id_fkey` FOREIGN KEY (`programation_id`) REFERENCES `programation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
