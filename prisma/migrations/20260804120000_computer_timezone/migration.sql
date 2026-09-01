-- Zona horaria del pais del equipo, derivada de su IP publica (ver wsHub.ts) -- reemplaza el
-- supuesto de que todos los equipos estan en Colombia (-05:00) al convertir timestamps.
ALTER TABLE `computers` ADD COLUMN `timezone_name` VARCHAR(100) NULL;
ALTER TABLE `computers` ADD COLUMN `timezone_offset_minutes` INT NULL;
