-- state_logs: agrega `code` crudo (independiente del ciclo de vida del catalogo) y afloja las FK
-- para que borrar un estado/categoria del catalogo nunca bloquee ni pierda el historico.
ALTER TABLE `state_logs` ADD COLUMN `code` INTEGER NULL;

UPDATE `state_logs` sl
    JOIN `states` s ON s.`id` = sl.`state_id`
    SET sl.`code` = s.`code`;

ALTER TABLE `state_logs` MODIFY `code` INTEGER NOT NULL;

ALTER TABLE `state_logs` DROP FOREIGN KEY `state_logs_state_id_fkey`;
ALTER TABLE `state_logs` DROP FOREIGN KEY `state_logs_category_id_fkey`;

ALTER TABLE `state_logs` MODIFY `state_id` INTEGER NULL, MODIFY `category_id` INTEGER NULL;

ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `state_logs` ADD CONSTRAINT `state_logs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `state_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- states.category_id: si se borra la categoria, el estado queda "sin categoria" en vez de bloquear el borrado.
ALTER TABLE `states` DROP FOREIGN KEY `states_category_id_fkey`;

ALTER TABLE `states` MODIFY `category_id` INTEGER NULL;

ALTER TABLE `states` ADD CONSTRAINT `states_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `state_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
