import { appuser, Prisma } from "@prisma/client";
import Service from "../service";
import prisma from "../../lib/prisma";

class AppUserService extends Service<appuser, Prisma.appuserCreateInput, Prisma.appuserUpdateInput, Prisma.appuserWhereInput, Prisma.appuserWhereUniqueInput> {

  protected model = prisma.appuser
}


export type { AppUserService }

export default new AppUserService()