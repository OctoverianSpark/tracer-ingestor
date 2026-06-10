import { Router } from "express";
import computerController, { listMachines, lockMachine, shutdownMachine, restartMachine, notifyMachine, sendFileToMachine, getReport, getScreenshot, getAll } from "../controllers/computer.controller.js"
import { upload } from "../config/multer.js";
import multer from "multer";


const computerRoutes = Router()



computerRoutes.post("/:serial/lock", lockMachine)
computerRoutes.post("/:serial/shutdown", shutdownMachine)
computerRoutes.post("/:serial/restart", restartMachine)
computerRoutes.post("/:serial/notify", notifyMachine)
computerRoutes.get("/", getAll)
computerRoutes.delete("/delete/:serial", computerController.deleteBySerial)
computerRoutes.get("/list", listMachines)
computerRoutes.get("/get-report", getReport)
computerRoutes.post('/:serial/send-file', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(413).json({ error: `Archivo muy grande: ${err.message}` })
    }
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    next()
  })
}, sendFileToMachine)
computerRoutes.get("/screenshot/:machine/:filename", getScreenshot)

export default computerRoutes