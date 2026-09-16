import { Router } from "express";
import appUsageLogsController from "../controllers/app_usage_logs.controller.js";

const appUsageLogsRoutes = Router();

appUsageLogsRoutes.get("/", appUsageLogsController.getAll);
appUsageLogsRoutes.get("/by-date", appUsageLogsController.findByDate);
appUsageLogsRoutes.get("/by-date/summary", appUsageLogsController.findByDateSummary);
appUsageLogsRoutes.get("/find/:id", appUsageLogsController.getById);
appUsageLogsRoutes.post("/save", appUsageLogsController.save);
appUsageLogsRoutes.put("/update/:id", appUsageLogsController.update);
appUsageLogsRoutes.delete("/delete/:id", appUsageLogsController.delete);

export default appUsageLogsRoutes;
