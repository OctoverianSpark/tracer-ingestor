import { report_types, Prisma } from "@prisma/client";
import Service from "../service.js";
import prisma from "../../lib/prisma.js";

class ReportTypeService extends Service<
  report_types,
  Prisma.report_typesCreateInput,
  Prisma.report_typesUpdateInput,
  Prisma.report_typesWhereInput,
  Prisma.report_typesWhereUniqueInput
> {
  protected model = prisma.report_types;

  async getAll(limit?: number, offset?: number, where?: Prisma.report_typesWhereInput) {
    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
      include: { assignments: { include: { group: true } } }
    });
  }
}

export type { ReportTypeService };
export default new ReportTypeService();
