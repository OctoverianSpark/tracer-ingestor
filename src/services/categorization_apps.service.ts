import { categorization_apps, category, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class CategorizationAppsService extends Service<
  categorization_apps,
  Prisma.categorization_appsCreateInput,
  Prisma.categorization_appsUpdateInput,
  Prisma.categorization_appsWhereInput,
  Prisma.categorization_appsWhereUniqueInput
> {
  protected model = prisma.categorization_apps;

  async findByCategory(cat: category): Promise<categorization_apps[]> {
    return this.model.findMany({ where: { category: cat } });
  }
}

export type { CategorizationAppsService };

export default new CategorizationAppsService();
