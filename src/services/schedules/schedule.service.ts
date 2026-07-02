import type { schedules, programation, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import Service from "../service.js";
import { parseDateOnly, getDayOfWeekLetter, diffInDays } from "../../utils/day-of-week.js";


class ScheduleService extends Service<schedules, Prisma.schedulesCreateInput, Prisma.schedulesUpdateInput, Prisma.schedulesWhereInput, Prisma.schedulesWhereUniqueInput> {
  protected model = prisma.schedules

  async getEffectiveSchedule(appuser_id: bigint, date: string): Promise<programation | null> {
    const targetDate = parseDateOnly(date);
    const dayKey = getDayOfWeekLetter(targetDate);

    const cycle = await prisma.rotation_cycles.findUnique({ where: { appuser_id } });

    if (cycle && targetDate.getTime() >= cycle.start_date.getTime()) {
      const diffDays = diffInDays(targetDate, cycle.start_date);
      const weekIndex = Math.floor(diffDays / 7) % cycle.weeks;

      const slot = await prisma.rotation_slots.findUnique({
        where: {
          rotation_cycle_id_week_index_day_of_week: {
            rotation_cycle_id: cycle.id,
            week_index: weekIndex,
            day_of_week: dayKey,
          },
        },
        include: { programation: true },
      });

      return slot ? slot.programation : null;
    }

    const schedule = await this.model.findUnique({
      where: { appuser_id_day_of_week: { appuser_id, day_of_week: dayKey } },
      include: { programation: true },
    });

    return schedule ? schedule.programation : null;
  }

  async saveMany(data: Prisma.schedulesCreateManyInput[]): Promise<schedules[]> {
    try {
      return await prisma.$transaction(
        data.map(item =>
          this.model.upsert({
            where: {
              appuser_id_day_of_week: {
                appuser_id: item.appuser_id as bigint,
                day_of_week: item.day_of_week as string,
              },
            },
            update: { programation_id: item.programation_id as bigint },
            create: item as Prisma.schedulesUncheckedCreateInput,
          })
        )
      );
    } catch (error) {
      throw new Error(`Error saving schedules: ${error}`);
    }
  }

}


export type { ScheduleService }
export default new ScheduleService()