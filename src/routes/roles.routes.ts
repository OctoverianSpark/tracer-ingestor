import { Router } from "express";
import rolesController from "../controllers/appuser/roles.controller";


const rolesRoutes = Router()


rolesRoutes.get('/', rolesController.getAll)
rolesRoutes.get('/find/:id', rolesController.getById)
rolesRoutes.post('/save', rolesController.save)
rolesRoutes.put('/update/:id', rolesController.update)
rolesRoutes.delete('/delete/:id', rolesController.delete)


export default rolesRoutes