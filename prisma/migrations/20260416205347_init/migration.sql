-- CreateTable
CREATE TABLE `computers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `serial_number` VARCHAR(255) NULL,
    `hostname` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `last_seen` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `personal_id` BIGINT NULL,

    UNIQUE INDEX `computers_serial_number_key`(`serial_number`),
    UNIQUE INDEX `computers_hostname_key`(`hostname`),
    INDEX `computers_hostname_idx`(`hostname`),
    INDEX `computers_personal_id_idx`(`personal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` TEXT NOT NULL,
    `role` ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` TEXT NOT NULL,
    `doc_type` INTEGER NOT NULL,
    `document` VARCHAR(150) NULL,
    `job_title` VARCHAR(120) NULL,
    `corporative_email` VARCHAR(191) NOT NULL DEFAULT '',
    `mode_type` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `group` INTEGER NULL,

    INDEX `personal_doc_type_mode_type_group_idx`(`doc_type`, `mode_type`, `group`),
    INDEX `personal_type_fkey`(`mode_type`, `group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_name` VARCHAR(191) NOT NULL,
    `personal_id` BIGINT NOT NULL,

    UNIQUE INDEX `groups_group_name_key`(`group_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(120) NOT NULL,
    `value` VARCHAR(120) NULL,
    `active` TINYINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `computer_id` BIGINT NOT NULL,
    `user_name` VARCHAR(100) NULL,
    `state` ENUM('working', 'break', 'wc', 'lunch', 'idle', 'offline') NOT NULL,
    `category` ENUM('active', 'neutral', 'inactive') NOT NULL,
    `type` ENUM('auto', 'manual') NOT NULL,
    `timestamp` DATETIME(0) NOT NULL,
    `reason` VARCHAR(255) NULL,

    INDEX `state_logs_computer_id_idx`(`computer_id`),
    INDEX `state_logs_timestamp_idx`(`timestamp`),
    INDEX `state_logs_computer_id_timestamp_idx`(`computer_id`, `timestamp`),
    INDEX `state_logs_state_idx`(`state`),
    INDEX `state_logs_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_usage_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `computer_id` BIGINT NOT NULL,
    `interval_start` DATETIME(0) NOT NULL,
    `interval_end` DATETIME(0) NOT NULL,
    `apps` JSON NOT NULL,

    INDEX `app_usage_logs_computer_id_idx`(`computer_id`),
    INDEX `app_usage_logs_interval_start_idx`(`interval_start`),
    INDEX `app_usage_logs_computer_id_interval_start_idx`(`computer_id`, `interval_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `start_day` VARCHAR(191) NOT NULL,
    `start_lunch` VARCHAR(191) NOT NULL,
    `end_lunch` VARCHAR(191) NOT NULL,
    `end_day` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `programation_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `personal_id` BIGINT NOT NULL,
    `programation_id` BIGINT NOT NULL,
    `day_of_week` VARCHAR(20) NOT NULL,

    INDEX `schedules_personal_id_idx`(`personal_id`),
    INDEX `schedules_programation_id_idx`(`programation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `computers` ADD CONSTRAINT `computers_personal_id_fkey` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal` ADD CONSTRAINT `personal_doc_type_fkey` FOREIGN KEY (`doc_type`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal` ADD CONSTRAINT `personal_mode_type_fkey` FOREIGN KEY (`mode_type`) REFERENCES `modes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal` ADD CONSTRAINT `personal_group_fkey` FOREIGN KEY (`group`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_computer_id_fkey` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_usage_logs` ADD CONSTRAINT `app_usage_logs_computer_id_fkey` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_personal_id_fkey` FOREIGN KEY (`personal_id`) REFERENCES `personal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_programation_id_fkey` FOREIGN KEY (`programation_id`) REFERENCES `programation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
