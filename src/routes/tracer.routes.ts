import { Router } from "express"
import { getStateLogs, syncStates, syncAppUsage, getUpdateInfo, downloadUpdate, uploadUpdate, getReleaseManifest, downloadPackage, getPermissions, validateEmail } from "../controllers/tracer.controller.js"
import { saveScreenShot, upload, uploadInstaller } from "../config/multer.js"
import reportController from "../controllers/reports/report.controller.js"
import { saveAgentLogs, getAgentLogs } from "../controllers/agent_logs.controller.js"

const tracerRoutes = Router()
tracerRoutes.post("/states", syncStates)
tracerRoutes.post("/app-usage", syncAppUsage)
tracerRoutes.post("/screenshot", upload.single("file"), saveScreenShot)
tracerRoutes.get("/get-state-logs", getStateLogs)
tracerRoutes.get("/permissions", getPermissions)
tracerRoutes.get("/validate-email", validateEmail)
tracerRoutes.post("/reports", reportController.createReport)
tracerRoutes.get("/reports", reportController.getAll)
tracerRoutes.post("/logs", saveAgentLogs)
tracerRoutes.get("/logs", getAgentLogs)

tracerRoutes.get("/updates", getUpdateInfo)
tracerRoutes.get("/updates/releases.win.json", getReleaseManifest)
tracerRoutes.get("/updates/download", downloadUpdate)
tracerRoutes.get("/updates/:filename", downloadPackage)
tracerRoutes.post("/updates", uploadInstaller.single("file"), uploadUpdate)

export default tracerRoutes