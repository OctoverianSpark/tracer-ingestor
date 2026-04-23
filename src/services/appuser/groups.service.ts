import { groups, Prisma } from "@prisma/client";
import Service from "../service";
import prisma from "../../lib/prisma";


class GroupService extends Service<groups, Prisma.groupsCreateInput, Prisma.groupsUpdateInput, Prisma.groupsWhereInput, Prisma.groupsWhereUniqueInput> {


  protected model = prisma.groups
}

export type { GroupService }
export default new GroupService
