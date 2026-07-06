import { reports, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class ReportService extends Service<
  reports,
  Prisma.reportsUncheckedCreateInput,
  Prisma.reportsUpdateInput,
  Prisma.reportsWhereInput,
  Prisma.reportsWhereUniqueInput
> {
  protected model = prisma.reports;

  async getAll(limit?: number, offset?: number, where?: Prisma.reportsWhereInput) {
    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
      orderBy: { created_at: "desc" },
      include: { report_type: true, computer: true, appuser: true }
    });
  }

  async createFromAgent(serial: string, report_type_id: number, message: string) {
    const computer = await prisma.computers.findUnique({ where: { serial_number: serial } });
    if (!computer) throw new Error("Computer not found");

    return this.model.create({
      data: {
        report_type_id,
        message,
        computer_id: computer.id,
        appuser_id: computer.appuser_id
      },
      include: { report_type: true, computer: true, appuser: true }
    });
  }
}

export type { ReportService };
export default new ReportService();
