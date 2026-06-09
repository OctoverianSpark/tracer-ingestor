import { Router } from "express";
import groupsController from "../controllers/appuser/groups.controller.js";

const groupsRouter = Router()

groupsRouter.get('/', groupsController.getAll)
groupsRouter.get('/find/:id', groupsController.getById)
groupsRouter.post('/save', groupsController.save)
groupsRouter.put('/update/:id', groupsController.update)
groupsRouter.delete('/delete/:id', groupsController.delete)

groupsRouter.get('/:id/visibility', groupsController.getVisibleGroups)
groupsRouter.post('/:id/visibility', groupsController.addVisibility)
groupsRouter.delete('/:id/visibility/:visible_id', groupsController.removeVisibility)

export default groupsRouter