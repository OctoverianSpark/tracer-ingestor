import { Router } from "express";
import programationController from "../controllers/schedules/programation.controller.js";


const programationRoutes = Router()


programationRoutes.get("/", programationController.getAll);
programationRoutes.get("/:id", programationController.getById);
programationRoutes.post("/save", programationController.save);
programationRoutes.put("/update/:id", programationController.update);
programationRoutes.delete("/delete/:id", programationController.delete);

export default programationRoutes;