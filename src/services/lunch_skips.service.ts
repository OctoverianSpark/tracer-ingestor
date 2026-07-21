import { lunch_skips, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class LunchSkipsService extends Service<
  lunch_skips,
  Prisma.lunch_skipsUncheckedCreateInput,
  Prisma.lunch_skipsUpdateInput,
  Prisma.lunch_skipsWhereInput,
  Prisma.lunch_skipsWhereUniqueInput
> {
  protected model = prisma.lunch_skips;

  // Idempotente por (appuser_id, date): un doble clic no debe fallar ni duplicar.
  async save(data: Prisma.lunch_skipsUncheckedCreateInput) {
    return this.model.upsert({
      where: { appuser_id_date: { appuser_id: data.appuser_id, date: data.date } },
      create: data,
      update: {},
    });
  }
}

export type { LunchSkipsService };
export default new LunchSkipsService();
