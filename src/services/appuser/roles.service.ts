import { Prisma, roles } from "@prisma/client";
import Service from "../service";
import prisma from "../../lib/prisma";

class RoleService extends Service<roles, Prisma.rolesCreateInput, Prisma.rolesUpdateInput, Prisma.rolesWhereInput, Prisma.rolesWhereUniqueInput> {

  protected model = prisma.roles



}



export type { RoleService }
export default new RoleService()