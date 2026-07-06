import { states, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class StatesService extends Service<
  states,
  Prisma.statesCreateInput,
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
}

export type { StatesService };
export default new StatesService();
