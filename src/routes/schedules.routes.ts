import { Router } from "express";
import schedulesController from "../controllers/schedules/schedules.controller.js";



const scheduleRoutes = Router()

scheduleRoutes.get('/', schedulesController.getAll)
scheduleRoutes.get('/effective', schedulesController.getEffective)
scheduleRoutes.post('/save', schedulesController.saveSchedules)
scheduleRoutes.get('/find/:id', schedulesController.getById)
scheduleRoutes.put('/update/:id', schedulesController.update)
scheduleRoutes.delete('/delete/:id', schedulesController.delete)


export default scheduleRoutes