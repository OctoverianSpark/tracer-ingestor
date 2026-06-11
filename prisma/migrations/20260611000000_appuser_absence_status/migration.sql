-- AlterTable: replace on_vacation boolean with absence_status enum
ALTER TABLE `appuser`
  DROP COLUMN `on_vacation`,
  ADD COLUMN `absence_status` ENUM('VACACIONES', 'INACTIVIDAD', 'AUSENCIA_MEDICA', 'PERMISO') NULL;
