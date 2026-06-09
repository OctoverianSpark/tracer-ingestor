import type { schedules, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import Service from "../service.js";


class ScheduleService extends Service<schedules, Prisma.schedulesCreateInput, Prisma.schedulesUpdateInput, Prisma.schedulesWhereInput, Prisma.schedulesWhereUniqueInput> {
  protected model = prisma.schedules

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