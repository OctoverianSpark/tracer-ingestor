-- group_state_visibility: catalogo de estados vuelve a ser unico/global (states/state_categories,
-- sin group_id). Esta tabla es lo unico configurable por grupo: una fila = "ese code (0-6) esta
-- oculto del menu del agente para este grupo". Sin fila = visible (hereda el catalogo global).
CREATE TABLE `group_state_visibility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `code` INTEGER NOT NULL,

    UNIQUE INDEX `group_state_visibility_group_id_code_key`(`group_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `group_state_visibility` ADD CONSTRAINT `group_state_visibility_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
