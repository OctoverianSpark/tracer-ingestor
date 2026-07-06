import prisma from "../../lib/prisma.js";

class ReportTypeAssignmentService {
  async getAll(report_type_id?: number, group_id?: number) {
    return prisma.report_type_assignments.findMany({
      where: {
        ...(report_type_id !== undefined && { report_type_id }),
        ...(group_id !== undefined && { group_id }),
      },
      include: { report_type: true, group: true }
    });
  }

  async assign(report_type_id: number, group_id: number) {
    return prisma.report_type_assignments.upsert({
      where: { report_type_id_group_id: { report_type_id, group_id } },
      create: { report_type_id, group_id },
      update: {}
    });
  }

  async unassign(report_type_id: number, group_id: number) {
    return prisma.report_type_assignments.delete({
      where: { report_type_id_group_id: { report_type_id, group_id } }
    });
  }
}

export type { ReportTypeAssignmentService };
export default new ReportTypeAssignmentService();
