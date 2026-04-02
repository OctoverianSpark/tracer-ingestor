import type { Request, Response } from "express";
import { wsHub } from "../wsHub.js";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ActionMessageTypes, MessageTypes, type ActionMessage, type FileMessage, type NotificationMessage, type WsMessage } from "../types/tracer.js";
import { createAction } from "../helpers/utils.js";

export async function lockMachine(req: Request, res: Response) {

  const { serial } = req.params

  const msg = createAction(ActionMessageTypes.Lock)
  console.log(msg);

  try {

    wsHub.sendTo(serial as string, msg as ActionMessage)

    res.json({ ok: true })
  } catch (err) {
    console.log(err);

    res.status(409).json({ error: "Maquina apagada o fuera de linea" })
  }



}



export async function notifyMachine(req: Request, res: Response) {

  const { serial } = req.params
  const { title, message } = req.body as { title: string; message: string }
  try {
    console.log(title, message);

    const msg: WsMessage = {
      type: MessageTypes.Notification,
      title: title as string,
      text: message as string
    } as NotificationMessage

    console.log(msg);


    wsHub.sendTo(serial as string, msg)
    res.json({ ok: true })

  } catch (error) {
    res.status(409).json({ error: "Maquina apagada o fuera de linea" })
  }

}
export async function listMachines(req: Request, res: Response) {

  try {
    const machines = wsHub.listAll();
    console.log(machines);


    res.json({ ok: true, machines })

  } catch (error) {
    res.status(409).json({ error: "Maquina apagada o fuera de linea" })
  }

}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', "screenshots");

export async function getReport(req: Request, res: Response) {
  const { computername, date } = req.query as { computername: string; date: string };

  if (!computername || !date) {
    res.status(400).json({ error: "Missing computername or date query parameters" });
    return;
  }


  try {
    console.log(computername);

    const allFiles = readdirSync(path.join(SCREENSHOTS_DIR, computername));

    const matched = allFiles.filter(file =>
      file.includes(date)
    );



    res.json({ ok: true, files: matched });
  } catch (ex) {
    console.error("[GET REPORT ERROR]", (ex as Error).message);
    res.status(500).json({ error: "Failed to read screenshots directory" });
  }
}
export async function getScreenshot(req: Request, res: Response) {
  try {
    const { filename } = req.params as { filename: string };
    const { machine } = req.params as { machine: string }
    console.log(filename, machine);


    const files = readdirSync(path.join(SCREENSHOTS_DIR, machine));
    console.log(files);

    if (!files.includes(filename)) {
      res.status(404).json({ error: "Screenshot not found" });
      return;
    }

    const filePath = path.join(SCREENSHOTS_DIR, machine, filename);
    console.log(filePath);

    res.sendFile(filePath);
  } catch (err) {
    console.error("[GET SCREENSHOT ERROR]", (err as Error).message);
    res.status(500).json({ error: "Error reading screenshots" });
  }
}

export async function sendFileToMachine(req: Request, res: Response) {
  try {
    const { serial } = req.params
    const file = req.file
    console.log(serial);

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    if (!serial) {
      return res.status(400).json({ error: 'Machine serial required' })
    }

    // Preparar el payload
    const payload: FileMessage = {
      type: MessageTypes.File,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      data: file.buffer.toString('base64')
    } as FileMessage

    // Enviar a través del WebSocket
    wsHub.sendTo(serial as string, payload)

    res.json({
      success: true,
      message: `File ${file.originalname} sent to ${serial}`,
      fileSize: file.size
    })

  } catch (error) {
    console.error('Error sending file:', error)


    res.status(500).json({ error: 'Failed to send file' })
  }
}