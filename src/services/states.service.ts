import { states, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class StatesService extends Service<
  states,
  Prisma.statesUncheckedCreateInput,
  Prisma.statesUpdateInput,
  Prisma.statesWhereInput,
  Prisma.statesWhereUniqueInput
> {
  protected model = prisma.states;

  async getAll(limit?: number, offset?: number, where?: Prisma.statesWhereInput) {
    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
      orderBy: { sort_order: "asc" },
      include: { category: true }
    });
  }

  /** El code (0-6) debe ser único dentro de su propio catálogo (mismo group_id, incluyendo el default). */
  async save(data: Prisma.statesUncheckedCreateInput) {
    const group_id = data.group_id ?? null;
    const duplicate = await this.model.findFirst({ where: { group_id, code: data.code } });
    if (duplicate) throw new Error(`El código ${data.code} ya está en uso en este catálogo`);
    return this.model.create({ data, include: { category: true } });
  }
}

export type { StatesService };
export default new StatesService();
