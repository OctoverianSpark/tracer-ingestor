import { state_categories, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class StateCategoriesService extends Service<
  state_categories,
  Prisma.state_categoriesCreateInput,
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
}

export type { StateCategoriesService };
export default new StateCategoriesService();
