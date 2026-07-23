import { Router } from "express";
import productivitySettingsController from "../controllers/productivity_settings.controller.js";

const productivitySettingsRoutes = Router();

productivitySettingsRoutes.get("/", productivitySettingsController.getSettings);
productivitySettingsRoutes.put("/", productivitySettingsController.updateSettings);

export default productivitySettingsRoutes;
