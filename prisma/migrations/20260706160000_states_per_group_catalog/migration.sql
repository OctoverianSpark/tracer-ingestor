-- state_categories: catalogo pasa a ser por grupo (group_id NULL = catalogo default), y agrega color.
ALTER TABLE `state_categories` ADD COLUMN `group_id` INTEGER NULL, ADD COLUMN `color` VARCHAR(20) NULL;

DROP INDEX `state_categories_key_key` ON `state_categories`;

CREATE INDEX `state_categories_group_id_idx` ON `state_categories`(`group_id`);

ALTER TABLE `state_categories` ADD CONSTRAINT `state_categories_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- states: reemplaza `key` (string) por `code` (0-6, el mismo valor que ya manda el agente), y agrega group_id.
ALTER TABLE `states` ADD COLUMN `group_id` INTEGER NULL, ADD COLUMN `code` INTEGER NULL;

UPDATE `states` SET `code` = CASE `key`
    WHEN 'working' THEN 0
    WHEN 'overtime' THEN 1
    WHEN 'break' THEN 2
    WHEN 'wc' THEN 3
    WHEN 'lunch' THEN 4
    WHEN 'idle' THEN 5
    WHEN 'offline' THEN 6
END;

ALTER TABLE `states` MODIFY `code` INTEGER NOT NULL;

DROP INDEX `states_key_key` ON `states`;
ALTER TABLE `states` DROP COLUMN `key`;

CREATE INDEX `states_group_id_idx` ON `states`(`group_id`);

ALTER TABLE `states` ADD CONSTRAINT `states_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
