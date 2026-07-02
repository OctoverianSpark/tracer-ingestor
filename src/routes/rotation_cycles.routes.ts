import { Router } from "express";
import rotationCycleController from "../controllers/schedules/rotation_cycle.controller.js";

const rotationCycleRoutes = Router()

rotationCycleRoutes.get('/', rotationCycleController.getAll)
rotationCycleRoutes.get('/:id/slots', rotationCycleController.getSlots)
rotationCycleRoutes.post('/save', rotationCycleController.saveCycle)
rotationCycleRoutes.delete('/delete/:id', rotationCycleController.delete)

export default rotationCycleRoutes
