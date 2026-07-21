import { Router } from "express";
import lunchSkipsController from "../controllers/lunch_skips.controller.js";

const lunchSkipsRoutes = Router();

lunchSkipsRoutes.get("/", lunchSkipsController.getAll);
lunchSkipsRoutes.post("/save", lunchSkipsController.save);
lunchSkipsRoutes.delete("/delete/:id", lunchSkipsController.delete);

export default lunchSkipsRoutes;
