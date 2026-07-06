import { Router } from "express";
import statesController from "../controllers/states.controller.js";

const statesRoutes = Router();

statesRoutes.get("/", statesController.getAll);
statesRoutes.get("/find/:id", statesController.getById);
statesRoutes.post("/save", statesController.save);
statesRoutes.put("/update/:id", statesController.update);
statesRoutes.delete("/delete/:id", statesController.delete);

export default statesRoutes;
