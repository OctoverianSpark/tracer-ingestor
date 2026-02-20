import { Router } from "express"
import { getBatchData, ingestBatch, saveScreenShot } from "../controllers/tracer.controller.js"
import { upload } from "../config/multer.js"

const tracerRoutes = Router()
tracerRoutes.post("/batch", ingestBatch)
tracerRoutes.post("/activity-batch", getBatchData)
tracerRoutes.post("/screenshot", upload.single("file"),saveScreenShot)
tracerRoutes.post("/time-batch", getBatchData)




export default tracerRoutes