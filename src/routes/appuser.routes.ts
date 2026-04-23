import { Router } from "express";
import appuserController from "../controllers/appuser/appuser.controller";


const appUserRoutes = Router()



appUserRoutes.get('/', appuserController.getAll)
appUserRoutes.get('/findbyemail', appuserController.findByEmail)
appUserRoutes.get('/find/:id', appuserController.getById)
appUserRoutes.delete('/delete', appuserController.delete)
appUserRoutes.post('/save', appuserController.save)
appUserRoutes.put('/update/:id', appuserController.update)


export default appUserRoutes