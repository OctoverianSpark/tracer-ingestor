import type { schedules, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import Service from "../service.js";


class ScheduleService extends Service<schedules, Prisma.schedulesCreateInput, Prisma.schedulesUpdateInput, Prisma.schedulesWhereInput, Prisma.schedulesWhereUniqueInput> {
  protected model = prisma.schedules

  async saveMany(data: Prisma.schedulesCreateManyInput[]): Promise<schedules[]> {
    try {
      const affectedUserIds = [
        ...new Set(
          data
            .map(item => item.appuser_id)
            .filter((id): id is bigint => id != null)
        )
      ];

      return await prisma.$transaction(async (tx) => {
        if (affectedUserIds.length > 0) {
          await tx.schedules.deleteMany({
            where: { appuser_id: { in: affectedUserIds } }
          });
        }

        return Promise.all(
          data.map(item =>
            tx.schedules.create({
              data: item as Prisma.schedulesUncheckedCreateInput
            })
          )
        );
      });
    } catch (error) {
      throw new Error(`Error saving schedules: ${error}`);
    }
  }

}


export type { ScheduleService }
export default new ScheduleService()