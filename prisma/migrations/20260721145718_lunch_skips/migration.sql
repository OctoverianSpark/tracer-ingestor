-- lunch_skips: excepcion puntual por usuario+fecha. Presencia de fila = "sin almuerzo ese dia".
-- No toca `programation` (fila de catalogo compartida) ni `schedules`.
CREATE TABLE `lunch_skips` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `appuser_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,

    UNIQUE INDEX `lunch_skips_appuser_id_date_key`(`appuser_id`, `date`),
    INDEX `lunch_skips_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `lunch_skips` ADD CONSTRAINT `lunch_skips_appuser_id_fkey` FOREIGN KEY (`appuser_id`) REFERENCES `appuser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
