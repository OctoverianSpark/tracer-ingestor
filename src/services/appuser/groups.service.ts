import { groups, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";


class GroupService extends Service<groups, Prisma.groupsCreateInput, Prisma.groupsUpdateInput, Prisma.groupsWhereInput, Prisma.groupsWhereUniqueInput> {

  protected model = prisma.groups

  async getVisibleGroups(viewerGroupId: number) {
    return prisma.group_visibility.findMany({
      where: { viewer_group_id: viewerGroupId },
      include: { visible_group: true }
    });
  }

  async addVisibility(viewerGroupId: number, visibleGroupId: number) {
    return prisma.group_visibility.create({
      data: { viewer_group_id: viewerGroupId, visible_group_id: visibleGroupId }
    });
  }

  async removeVisibility(viewerGroupId: number, visibleGroupId: number) {
    return prisma.group_visibility.delete({
      where: {
        viewer_group_id_visible_group_id: {
          viewer_group_id: viewerGroupId,
          visible_group_id: visibleGroupId
        }
      }
    });
  }
}

export type { GroupService }
export default new GroupService
