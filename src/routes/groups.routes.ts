import { Router } from "express";
import groupsController from "../controllers/appuser/groups.controller.js";

const groupsRouter = Router()

groupsRouter.get('/', groupsController.getAll)
groupsRouter.get('/find/:id', groupsController.getById)
groupsRouter.post('/save', groupsController.save)
groupsRouter.put('/update/:id', groupsController.update)
groupsRouter.delete('/delete/:id', groupsController.delete)

export default groupsRouter