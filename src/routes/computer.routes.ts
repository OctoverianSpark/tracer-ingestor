import { Router } from "express";
import { listMachines, lockMachine, notifyMachine, sendFileToMachine,getReport,getScreenshot } from "../controllers/computer.controller.js"
import { upload } from "../config/multer.js";


const computerRoutes = Router()



computerRoutes.post("/:serial/lock",lockMachine)
computerRoutes.post("/:serial/notify",notifyMachine)
computerRoutes.get("/list",listMachines)
computerRoutes.get("/get-report",getReport)
computerRoutes.post('/:serial/send-file', upload.single('file'), sendFileToMachine)
computerRoutes.get("/screenshot/:filename",getScreenshot)

export default computerRoutes