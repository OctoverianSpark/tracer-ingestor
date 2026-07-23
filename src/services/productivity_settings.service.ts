import type { productivity_settings, Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import Service from "./service.js";

class ProductivitySettingsService extends Service<
  productivity_settings,
  Prisma.productivity_settingsUncheckedCreateInput,
  Prisma.productivity_settingsUpdateInput,
  Prisma.productivity_settingsWhereInput,
  Prisma.productivity_settingsWhereUniqueInput
> {
  protected model = prisma.productivity_settings;

  // Fila única (id=1) — upsert en vez de depender de que el seed de la migración haya corrido.
  async getSingleton(): Promise<productivity_settings> {
    return this.model.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async save(data: { uncategorized_credit: number; productive_credit: number }): Promise<productivity_settings> {
    return this.model.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  }
}

export type { ProductivitySettingsService }
export default new ProductivitySettingsService()
