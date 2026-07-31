-- Apodo opcional por equipo para facilitar la busqueda, sobre todo cuando un mismo usuario
-- tiene varios equipos asignados (hostname/serial no siempre son faciles de distinguir a simple
-- vista). Nullable, sin default: los equipos existentes quedan sin apodo hasta que se les asigne.
ALTER TABLE `computers` ADD COLUMN `nickname` VARCHAR(255) NULL;
