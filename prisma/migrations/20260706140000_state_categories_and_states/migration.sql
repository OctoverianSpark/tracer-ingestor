-- CreateTable
CREATE TABLE `state_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `state_categories_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `state_category_id` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `states_key_key`(`key`),
    INDEX `states_state_category_id_idx`(`state_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `states` ADD CONSTRAINT `states_state_category_id_fkey` FOREIGN KEY (`state_category_id`) REFERENCES `state_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed: valores que antes eran los enums fijos state_log_category / state_log_state.
-- El mapeo estado -> categoria se tomo por mayoria historica real de state_logs
-- (working/overtime -> active, break/wc -> neutral, lunch/idle/offline -> inactive).
INSERT INTO `state_categories` (`id`, `key`, `name`, `sort_order`) VALUES
    (1, 'active', 'Activo', 1),
    (2, 'neutral', 'Neutral', 2),
    (3, 'inactive', 'Inactivo', 3);

INSERT INTO `states` (`id`, `key`, `name`, `state_category_id`, `sort_order`) VALUES
    (1, 'working', 'Trabajando', 1, 1),
    (2, 'overtime', 'Tiempo extra', 1, 2),
    (3, 'break', 'Descanso', 2, 3),
    (4, 'wc', 'WC', 2, 4),
    (5, 'lunch', 'Almuerzo', 3, 5),
    (6, 'idle', 'Inactivo', 3, 6),
    (7, 'offline', 'Desconectado', 3, 7);

-- Migrate state_logs: agregar columnas FK nullable, hacer backfill desde los enums viejos.
ALTER TABLE `state_logs` ADD COLUMN `state_id` INTEGER NULL, ADD COLUMN `category_id` INTEGER NULL;

UPDATE `state_logs` sl
    JOIN `states` s ON s.`key` = sl.`state`
    SET sl.`state_id` = s.`id`, sl.`category_id` = s.`state_category_id`;

-- Ya con backfill completo, las columnas pasan a ser obligatorias.
ALTER TABLE `state_logs` MODIFY `state_id` INTEGER NOT NULL, MODIFY `category_id` INTEGER NOT NULL;

-- DropIndex (sobre las columnas enum que se eliminan)
DROP INDEX `state_logs_state_idx` ON `state_logs`;
DROP INDEX `state_logs_category_idx` ON `state_logs`;

-- DropColumn (enums reemplazados por las FKs de arriba)
ALTER TABLE `state_logs` DROP COLUMN `state`, DROP COLUMN `category`;

-- CreateIndex
CREATE INDEX `state_logs_state_id_idx` ON `state_logs`(`state_id`);
CREATE INDEX `state_logs_category_id_idx` ON `state_logs`(`category_id`);

-- AddForeignKey
ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `state_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
