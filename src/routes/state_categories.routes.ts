import { Router } from "express";
import stateCategoriesController from "../controllers/state_categories.controller.js";

const stateCategoriesRoutes = Router();

stateCategoriesRoutes.get("/", stateCategoriesController.getAll);
stateCategoriesRoutes.get("/find/:id", stateCategoriesController.getById);
stateCategoriesRoutes.post("/save", stateCategoriesController.save);
stateCategoriesRoutes.put("/update/:id", stateCategoriesController.update);
stateCategoriesRoutes.delete("/delete/:id", stateCategoriesController.delete);

export default stateCategoriesRoutes;
