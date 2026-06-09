import { appuser, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class AppUserService extends Service<appuser, Prisma.appuserCreateInput, Prisma.appuserUpdateInput, Prisma.appuserWhereInput, Prisma.appuserWhereUniqueInput> {

  protected model = prisma.appuser

  async getAllWithScheduleFilter(
    limit?: number,
    offset?: number,
    where?: Prisma.appuserWhereInput,
    hasSchedule?: boolean
  ): Promise<appuser[]> {
    const scheduleFilter: Prisma.appuserWhereInput =
      hasSchedule === true
        ? { schedules: { some: {} } }
        : hasSchedule === false
          ? { schedules: { none: {} } }
          : {};

    return this.model.findMany({
      where: { ...where, ...scheduleFilter },
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
    });
  }

  async deleteMany(ids: number[]) {

    const deletedUsers = await prisma.appuser.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    return deletedUsers
  }
}


export type { AppUserService }

export default new AppUserService()