import { state_categories, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

type SaveStateCategoryInput = Prisma.state_categoriesUncheckedCreateInput & { id?: number };

class StateCategoriesService extends Service<
  state_categories,
  Prisma.state_categoriesUncheckedCreateInput,
  Prisma.state_categoriesUpdateInput,
  Prisma.state_categoriesWhereInput,
  Prisma.state_categoriesWhereUniqueInput
> {
  protected model = prisma.state_categories;

  async getAll(limit?: number, offset?: number, where?: Prisma.state_categoriesWhereInput) {
    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
      orderBy: { sort_order: "asc" }
    });
  }

  /** Upsert por id. `key` es único dentro del catálogo (mismo group_id), no globalmente. */
  async save(data: SaveStateCategoryInput) {
    const { id, ...rest } = data;
    const group_id = rest.group_id ?? null;

    const duplicate = await this.model.findFirst({
      where: { group_id, key: rest.key, ...(id !== undefined && { id: { not: id } }) }
    });
    if (duplicate) throw new Error(`La key "${rest.key}" ya está en uso en este catálogo`);

    if (id !== undefined) {
      return this.model.update({ where: { id }, data: rest });
    }
    return this.model.create({ data: rest });
  }
}

export type { StateCategoriesService };
export default new StateCategoriesService();
