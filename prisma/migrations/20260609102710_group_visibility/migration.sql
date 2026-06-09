-- CreateTable
CREATE TABLE `group_visibility` (
    `viewer_group_id` INTEGER NOT NULL,
    `visible_group_id` INTEGER NOT NULL,

    INDEX `group_visibility_visible_group_id_idx`(`visible_group_id`),
    PRIMARY KEY (`viewer_group_id`, `visible_group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_visibility` ADD CONSTRAINT `group_visibility_viewer_group_id_fkey` FOREIGN KEY (`viewer_group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_visibility` ADD CONSTRAINT `group_visibility_visible_group_id_fkey` FOREIGN KEY (`visible_group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
