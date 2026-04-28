import { appuser, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class AppUserService extends Service<appuser, Prisma.appuserCreateInput, Prisma.appuserUpdateInput, Prisma.appuserWhereInput, Prisma.appuserWhereUniqueInput> {

  protected model = prisma.appuser

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