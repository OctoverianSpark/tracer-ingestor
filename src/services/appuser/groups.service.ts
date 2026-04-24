import { groups, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";


class GroupService extends Service<groups, Prisma.groupsCreateInput, Prisma.groupsUpdateInput, Prisma.groupsWhereInput, Prisma.groupsWhereUniqueInput> {


  protected model = prisma.groups
}

export type { GroupService }
export default new GroupService
