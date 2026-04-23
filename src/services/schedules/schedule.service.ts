import type { schedules, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import Service from "../service.js";


class ScheduleService extends Service<schedules, Prisma.schedulesCreateInput, Prisma.schedulesUpdateInput, Prisma.schedulesWhereInput, Prisma.schedulesWhereUniqueInput> {
  protected model = prisma.schedules

  async saveMany(data: Prisma.schedulesCreateManyInput[]): Promise<schedules[]> {
    try {
      const createdSchedules = await this.model.createMany({
        data,
        skipDuplicates: true,
      });
      return createdSchedules as unknown as schedules[];
    } catch (error) {
      throw new Error(`Error saving schedules: ${error}`);
    }
  }

}


export type { ScheduleService }
export default new ScheduleService()