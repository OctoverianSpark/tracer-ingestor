-- Rename states.state_category_id -> states.category_id (el dashboard ya llama al campo category_id).
ALTER TABLE `states` DROP FOREIGN KEY `states_state_category_id_fkey`;
DROP INDEX `states_state_category_id_idx` ON `states`;

ALTER TABLE `states` RENAME COLUMN `state_category_id` TO `category_id`;

CREATE INDEX `states_category_id_idx` ON `states`(`category_id`);

ALTER TABLE `states` ADD CONSTRAINT `states_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `state_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
