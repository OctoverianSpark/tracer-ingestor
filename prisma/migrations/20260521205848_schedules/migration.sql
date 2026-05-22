/*
  Warnings:

  - A unique constraint covering the columns `[appuser_id,day_of_week]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `schedules_appuser_id_day_of_week_key` ON `schedules`(`appuser_id`, `day_of_week`);
