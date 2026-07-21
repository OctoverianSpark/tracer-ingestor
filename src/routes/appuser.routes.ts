import { Router } from "express";
import appuserController from "../controllers/appuser/appuser.controller.js";


const appUserRoutes = Router()



appUserRoutes.get('/', appuserController.getAll)
appUserRoutes.get('/findbyemail', appuserController.findByEmail)
appUserRoutes.get('/find/:id', appuserController.getById)
appUserRoutes.delete('/delete', appuserController.deleteMany)
appUserRoutes.post('/save', appuserController.save)
appUserRoutes.put('/update/:id', appuserController.update)
appUserRoutes.get('/:id/force-logout-status', appuserController.getForceLogoutStatus)
appUserRoutes.post('/:id/revoke-session', appuserController.revokeSession)
appUserRoutes.post('/revoke-all-sessions', appuserController.revokeAllSessions)


export default appUserRoutes