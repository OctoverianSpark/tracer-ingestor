import { Router } from "express";
import groupStateVisibilityController from "../controllers/group_state_visibility.controller.js";

const groupStateVisibilityRoutes = Router();

groupStateVisibilityRoutes.get("/", groupStateVisibilityController.getAll);
groupStateVisibilityRoutes.post("/save", groupStateVisibilityController.save);
groupStateVisibilityRoutes.delete("/delete/:id", groupStateVisibilityController.delete);

export default groupStateVisibilityRoutes;
