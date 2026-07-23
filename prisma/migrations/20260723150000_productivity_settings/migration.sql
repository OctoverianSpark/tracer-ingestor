-- Fila única (id fijo en 1) — pesos configurables del cálculo "Global" de productividad
-- (lib/productivity.ts en tracer-dashboard). Se siembra la fila acá para que el GET nunca
-- encuentre la tabla vacía.
CREATE TABLE `productivity_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `uncategorized_credit` DOUBLE NOT NULL DEFAULT 0.7,
    `productive_credit` DOUBLE NOT NULL DEFAULT 1.5,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `productivity_settings` (`id`, `uncategorized_credit`, `productive_credit`, `updated_at`)
VALUES (1, 0.7, 1.5, NOW(3));
