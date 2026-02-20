import type { Request, Response } from "express";
import { wsHub } from "../wsHub.js";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

enum Types {
        PING,
        COMMAND,
        NOTIFICATION,
        FILE
}

interface FilePayload {
  type: Types.FILE
  fileName: string
  fileSize: number
  mimeType: string
  data: string // Base64
}
export async function lockMachine(req:Request, res:Response){

  const {serial} = req.params

  console.log(serial);
  


  try {
    
    wsHub.sendTo(serial as string,{
      type: Types.COMMAND,
      command: "LOCK"
    })

    res.json({ok:true})
  } catch (err) {
    console.log(err);
    
    res.status(409).json({error: "Maquina apagada o fuera de linea"})
  }



}


export async function notifyMachine(req:Request, res:Response){

  const {serial } = req.params
  const {title,message} = req.body
  try {
    console.log(title,message);
    
    wsHub.sendTo(serial as string,{
      type:Types.NOTIFICATION,
      title:title,
      msg: message
    })
    res.json({ok: true})
    
  } catch (error) {
    res.status(409).json({error:"Maquina apagada o fuera de linea"})
  }

}
export async function listMachines(req:Request, res:Response){

  try {
    const machines = wsHub.listOnline();

    res.json({ok: true,machines})
    
  } catch (error) {
    res.status(409).json({error:"Maquina apagada o fuera de linea"})
  }

}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname,'..','..', "screenshots");

export async function getReport(req: Request, res: Response) {
  const { computername, date } = req.query as { computername: string; date: string };

  if (!computername || !date) {
    res.status(400).json({ error: "Missing computername or date query parameters" });
    return;
  }

  const filteredDate = date.replace(/-/g, ""); // "2026-02-20" -> "20260220"

  try {
    const allFiles = readdirSync(SCREENSHOTS_DIR);

    const matched = allFiles.filter(file =>
      file.includes(computername) && file.includes(filteredDate)
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
    console.log(filename);
    

    const files = readdirSync(SCREENSHOTS_DIR);
    if (!files.includes(filename)) {
      res.status(404).json({ error: "Screenshot not found" });
      return;
    }

    const filePath = path.join(SCREENSHOTS_DIR, filename);
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
    const payload:FilePayload = {
      type: Types.FILE,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      data: file.buffer.toString('base64')
    }

    // Enviar a través del WebSocket
    wsHub.sendFile(serial as string, payload)

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