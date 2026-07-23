-- skip_lunch: excepcion RECURRENTE (por asignacion, no por fecha puntual) de que un usuario no
-- tiene almuerzo ese dia de la semana. Distinta de lunch_skips (fecha puntual). Default false =
-- comportamiento actual sin cambios para todo lo ya asignado.
ALTER TABLE `schedules` ADD COLUMN `skip_lunch` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `rotation_slots` ADD COLUMN `skip_lunch` BOOLEAN NOT NULL DEFAULT false;
