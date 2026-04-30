import { Router } from "express";
import categorizationAppsController from "../controllers/categorization_apps.controller.js";

const categorizationAppsRoutes = Router();

categorizationAppsRoutes.get("/", categorizationAppsController.getAll);
categorizationAppsRoutes.get("/by-category", categorizationAppsController.findByCategory);
categorizationAppsRoutes.get("/find/:id", categorizationAppsController.getById);
categorizationAppsRoutes.post("/save", categorizationAppsController.save);
categorizationAppsRoutes.put("/update/:id", categorizationAppsController.update);
categorizationAppsRoutes.delete("/delete/:id", categorizationAppsController.delete);

export default categorizationAppsRoutes;
