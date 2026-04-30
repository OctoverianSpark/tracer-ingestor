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
}

export type { AppUsageLogsService };

export default new AppUsageLogsService();
