-- Multiplicador configurable del tiempo improductivo dentro del factor de calidad de apps
-- (lib/productivity.ts en tracer-dashboard) — antes el tiempo improductivo no sumaba nada al
-- ratio de calidad (crédito implícito 0), lo que castigaba el % Global al máximo por cada segundo
-- improductivo. Con este campo se puede subir ese piso desde Admin > Configuración.
ALTER TABLE `productivity_settings` ADD COLUMN `unproductive_credit` DOUBLE NOT NULL DEFAULT 0.2;
