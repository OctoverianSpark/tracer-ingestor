import { app_usage_logs, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class AppUsageLogsService extends Service<
  app_usage_logs,
  Prisma.app_usage_logsCreateInput,
  Prisma.app_usage_logsUpdateInput,
  Prisma.app_usage_logsWhereInput,
  Prisma.app_usage_logsWhereUniqueInput
> {
  protected model = prisma.app_usage_logs;

  // Sin el JSON `apps` (que puede pesar la mayoría del payload) — para llamadores que solo
  // necesitan saber CUÁNDO hubo actividad (ej. cerrar ventanas abiertas de state_logs), no QUÉ
  // apps se usaron. Ver findByDateSummary en el controller.
  async getSummary(where: Prisma.app_usage_logsWhereInput) {
    return this.model.findMany({
      where,
      select: { id: true, computer_id: true, interval_start: true, interval_end: true },
    });
  }
}

export type { AppUsageLogsService };

export default new AppUsageLogsService();
