import { report_type_assignments, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class ReportTypeAssignmentService extends Service<
  report_type_assignments,
  Prisma.report_type_assignmentsUncheckedCreateInput,
  Prisma.report_type_assignmentsUpdateInput,
  Prisma.report_type_assignmentsWhereInput,
  Prisma.report_type_assignmentsWhereUniqueInput
> {
  protected model = prisma.report_type_assignments;

  async getAll(limit?: number, offset?: number, where?: Prisma.report_type_assignmentsWhereInput) {
    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
      include: { report_type: true, group: true }
    });
  }

  async save(data: Prisma.report_type_assignmentsUncheckedCreateInput) {
    return this.model.upsert({
      where: { report_type_id_group_id: { report_type_id: data.report_type_id, group_id: data.group_id } },
      create: data,
      update: {}
    });
  }
}

export type { ReportTypeAssignmentService };
export default new ReportTypeAssignmentService();
