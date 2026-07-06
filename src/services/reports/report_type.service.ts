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

  /** El dashboard hace create-or-update contra un único POST /save. */
  async save(data: Prisma.report_typesUncheckedCreateInput): Promise<report_types> {
    if (data.id !== undefined && data.id !== null) {
      const { id, ...rest } = data;
      return this.model.update({ where: { id }, data: rest });
    }
    return this.model.create({ data });
  }
}

export type { ReportTypeService };
export default new ReportTypeService();
