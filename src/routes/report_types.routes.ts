import { Router } from "express";
import reportTypeController from "../controllers/reports/report_type.controller.js";

const reportTypesRoutes = Router();

reportTypesRoutes.get("/", reportTypeController.getAll);
reportTypesRoutes.get("/find/:id", reportTypeController.getById);
reportTypesRoutes.post("/save", reportTypeController.save);
reportTypesRoutes.put("/update/:id", reportTypeController.update);
reportTypesRoutes.delete("/delete/:id", reportTypeController.delete);

export default reportTypesRoutes;
