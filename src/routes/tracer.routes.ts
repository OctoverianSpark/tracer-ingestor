import { Router } from "express"
import { getStateLogs, syncStates, syncAppUsage, ProgramationSave, GetProgramations, SchedulePersonal, GetSchedules } from "../controllers/tracer.controller.js"
import { saveScreenShot, upload } from "../config/multer.js"

const tracerRoutes = Router()
tracerRoutes.post("/states", syncStates)
tracerRoutes.post("/app-usage", syncAppUsage)
tracerRoutes.post("/screenshot", upload.single("file"), saveScreenShot)
tracerRoutes.get("/get-state-logs", getStateLogs)




export default tracerRoutes