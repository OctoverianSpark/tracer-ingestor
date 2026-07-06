import { states, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

type SaveStateInput = Prisma.statesUncheckedCreateInput & { id?: number };

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

  /**
   * Upsert por id. Valida que `code` sea único dentro del catálogo (mismo group_id)
   * y que `category_id` pertenezca a ese mismo catálogo.
   */
  async save(data: SaveStateInput) {
    const { id, ...rest } = data;
    const group_id = rest.group_id ?? null;

    const duplicate = await this.model.findFirst({
      where: { group_id, code: rest.code, ...(id !== undefined && { id: { not: id } }) }
    });
    if (duplicate) throw new Error(`El código ${rest.code} ya está en uso en este catálogo`);

    if (rest.category_id !== undefined && rest.category_id !== null) {
      const category = await prisma.state_categories.findUnique({ where: { id: rest.category_id } });
      if (!category) throw new Error("category_id no existe");
      if ((category.group_id ?? null) !== group_id) throw new Error("category_id no pertenece a este catálogo (group_id distinto)");
    }

    if (id !== undefined) {
      return this.model.update({ where: { id }, data: rest, include: { category: true } });
    }
    return this.model.create({ data: rest, include: { category: true } });
  }
}

export type { StatesService };
export default new StatesService();
