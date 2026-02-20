-- CreateTable
CREATE TABLE `computers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(64) NOT NULL,
    `hostname` VARCHAR(255) NOT NULL,
    `os` VARCHAR(100) NULL,
    `ip_address` VARCHAR(50) NULL,
    `last_seen` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uuid`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_types` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `value` VARCHAR(120) NULL,
    `active` TINYINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal` (
    `id` INTEGER NOT NULL,
    `first_name` TEXT NOT NULL,
    `middle_name` TEXT NULL,
    `last_name` TEXT NOT NULL,
    `doc_type` TEXT NULL,
    `document` VARCHAR(150) NULL,
    `job_title` VARCHAR(120) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `state_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `computer_id` BIGINT NOT NULL,
    `user_name` VARCHAR(100) NULL,
    `timestamp` DATETIME(0) NOT NULL,
    `state` ENUM('active', 'idle', 'productive', 'unproductive', 'locked') NULL,
    `reason` VARCHAR(255) NULL,

    INDEX `computer_id`(`computer_id`),
    INDEX `idx_state_time`(`timestamp`),
    INDEX `idx_state_user`(`user_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_mesh` (
    `id` INTEGER NOT NULL,
    `start` TIME(0) NOT NULL,
    `end` TIME(0) NOT NULL,
    `user` VARCHAR(255) NOT NULL,
    `break` TIME(0) NOT NULL,
    `lunch` TIME(0) NOT NULL,
    `overtime` TIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_summary_daily` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `computer_id` BIGINT NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `date` DATE NOT NULL,
    `active_time` INTEGER NULL DEFAULT 0,
    `idle_time` INTEGER NULL DEFAULT 0,
    `productive_time` INTEGER NULL DEFAULT 0,
    `unproductive_time` INTEGER NULL DEFAULT 0,
    `overtime_time` INTEGER NULL DEFAULT 0,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_summary_date`(`date`),
    INDEX `idx_summary_user`(`user_name`),
    UNIQUE INDEX `uq_daily`(`computer_id`, `user_name`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` TEXT NOT NULL,
    `role` ENUM('admin', 'manager', 'user') NULL DEFAULT 'user',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `window_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `computer_id` BIGINT NOT NULL,
    `user_name` VARCHAR(100) NULL,
    `timestamp` DATETIME(0) NOT NULL,
    `app_name` VARCHAR(255) NULL,
    `window_title` TEXT NULL,
    `url` TEXT NULL,
    `duration` INTEGER NULL,
    `idle` BOOLEAN NULL,

    INDEX `computer_id`(`computer_id`),
    INDEX `idx_time`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `state_events` ADD CONSTRAINT `state_events_ibfk_1` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `time_summary_daily` ADD CONSTRAINT `time_summary_daily_ibfk_1` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `window_logs` ADD CONSTRAINT `window_logs_ibfk_1` FOREIGN KEY (`computer_id`) REFERENCES `computers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
