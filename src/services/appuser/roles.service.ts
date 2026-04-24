import { Prisma, roles } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class RoleService extends Service<roles, Prisma.rolesCreateInput, Prisma.rolesUpdateInput, Prisma.rolesWhereInput, Prisma.rolesWhereUniqueInput> {

  protected model = prisma.roles



}



export type { RoleService }
export default new RoleService()