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

  // El dashboard usa JWT sin estado (sin tabla de sesiones) — esta marca es lo único que permite
  // invalidar una sesión ya emitida; el middleware la compara contra el valor congelado en el JWT.
  async revokeSession(id: bigint) {
    return prisma.appuser.update({
      where: { id },
      data: { force_logout_at: new Date() },
    })
  }

  async revokeAllSessions() {
    return prisma.appuser.updateMany({
      data: { force_logout_at: new Date() },
    })
  }
}


export type { AppUserService }

export default new AppUserService()