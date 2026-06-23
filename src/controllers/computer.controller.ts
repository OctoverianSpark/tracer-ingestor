import type { Request, Response } from "express";
import { wsHub } from "../wsHub.js";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ActionMessageTypes, MessageTypes, type ActionMessage, type FileMessage, type NotificationMessage, type WsMessage } from "../types/tracer.js";
import { createAction } from "../helpers/utils.js";
import prisma from "../lib/prisma.js";
import Controller from "./controller.js";
import computerService, { type ComputerService } from "../services/computer.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(process.env.SCREENSHOTS_PATH || "../screenshots");

class ComputerController extends Controller<ComputerService> {
  protected service = computerService;

  async deleteBySerial(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    console.log(`[DELETE] serial=${serial}`);
    try {
      await this.service.deleteBySerial(serial);
      wsHub.removeClient(serial);
      console.log(`[DELETE] OK serial=${serial}`);
      res.json({ ok: true });
    } catch (error: any) {
      if (error?.code === "P2025") {
        console.warn(`[DELETE] Not found serial=${serial}`);
        return res.status(404).json({ error: "Computer not found" });
      }
      console.error(`[DELETE] Error serial=${serial}`, error);
      res.status(500).json({ error: "Failed to delete computer" });
    }
  }

  async lockMachine(req: Request, res: Response) {
    const { serial } = req.params;
    console.log(`[LOCK] serial=${serial}`);
    const msg = createAction(ActionMessageTypes.Lock);
    try {
      wsHub.sendTo(serial as string, msg as ActionMessage);
      console.log(`[LOCK] OK serial=${serial}`);
      res.json({ ok: true });
    } catch (err) {
      console.error(`[LOCK] Error serial=${serial}`, err);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async shutdownMachine(req: Request, res: Response) {
    const { serial } = req.params;
    console.log(`[SHUTDOWN] serial=${serial}`);
    const msg = createAction(ActionMessageTypes.Shutdown);
    try {
      wsHub.sendTo(serial as string, msg as ActionMessage);
      console.log(`[SHUTDOWN] OK serial=${serial}`);
      res.json({ ok: true });
    } catch (err) {
      console.error(`[SHUTDOWN] Error serial=${serial}`, err);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async restartMachine(req: Request, res: Response) {
    const { serial } = req.params;
    console.log(`[RESTART] serial=${serial}`);
    const msg = createAction(ActionMessageTypes.Restart);
    try {
      wsHub.sendTo(serial as string, msg as ActionMessage);
      console.log(`[RESTART] OK serial=${serial}`);
      res.json({ ok: true });
    } catch (err) {
      console.error(`[RESTART] Error serial=${serial}`, err);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async notifyMachine(req: Request, res: Response) {
    const { serial } = req.params;
    const { title, message } = req.body as { title: string; message: string };
    console.log(`[NOTIFY] serial=${serial} title="${title}"`);
    try {
      const msg: WsMessage = {
        type: MessageTypes.Notification,
        title: title as string,
        text: message as string
      } as NotificationMessage;
      wsHub.sendTo(serial as string, msg);
      console.log(`[NOTIFY] OK serial=${serial}`);
      res.json({ ok: true });
    } catch (error) {
      console.error(`[NOTIFY] Error serial=${serial}`, error);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async setTakeScreenshots(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    const { enabled } = req.body as { enabled: boolean };
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be boolean" });
    }
    console.log(`[TAKE-SCREENSHOTS] serial=${serial} enabled=${enabled}`);
    try {
      await this.service.setTakeScreenshots(serial, enabled);
      res.json({ ok: true, serial, take_screenshots: enabled });
    } catch (error: any) {
      if (error?.code === "P2025") {
        return res.status(404).json({ error: "Computer not found" });
      }
      console.error(`[TAKE-SCREENSHOTS] Error serial=${serial}`, error);
      res.status(500).json({ error: "Failed to update permission" });
    }
  }

  async listMachines(req: Request, res: Response) {
    try {
      const machines = await wsHub.listAll();
      console.log(`[LIST] ${machines.length} machines`);
      res.json({ ok: true, machines: await Promise.all(machines) });
    } catch (error) {
      console.error("[LIST] Error", error);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async getReport(req: Request, res: Response) {
    const { computername, date } = req.query as { computername: string; date: string };
    if (!computername || !date) {
      res.status(400).json({ error: "Missing computername or date query parameters" });
      return;
    }
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(computername)) {
      console.warn(`[REPORT] Invalid computername="${computername}"`);
      return res.status(400).json({ error: "Invalid computername" });
    }
    console.log(`[REPORT] computername=${computername} date=${date}`);
    try {
      const allFiles = readdirSync(path.join(SCREENSHOTS_DIR, computername));
      const matched = allFiles.filter(file => file.includes(date));
      console.log(`[REPORT] ${matched.length} files matched`);
      res.json({ ok: true, files: matched });
    } catch (ex) {
      console.error(`[REPORT] Error computername=${computername}`, (ex as Error).message);
      res.status(500).json({ error: "Failed to read screenshots directory" });
    }
  }

  async getScreenshot(req: Request, res: Response) {
    const { filename, machine } = req.params as { filename: string; machine: string };
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(machine) || !/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
      console.warn(`[SCREENSHOT] Invalid params machine="${machine}" file="${filename}"`);
      return res.status(400).json({ error: "Invalid path parameter" });
    }
    console.log(`[SCREENSHOT] machine=${machine} file=${filename}`);
    try {
      const files = readdirSync(path.join(SCREENSHOTS_DIR, machine));
      if (!files.includes(filename)) {
        console.warn(`[SCREENSHOT] Not found file=${filename}`);
        res.status(404).json({ error: "Screenshot not found" });
        return;
      }
      const filePath = path.join(SCREENSHOTS_DIR, machine, filename);
      res.sendFile(filePath);
    } catch (err) {
      console.error(`[SCREENSHOT] Error machine=${machine}`, (err as Error).message);
      res.status(500).json({ error: "Error reading screenshots" });
    }
  }

  async sendFileToMachine(req: Request, res: Response) {
    const { serial } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    if (!serial) {
      return res.status(400).json({ error: 'Machine serial required' });
    }
    console.log(`[SEND-FILE] serial=${serial} file="${file.originalname}" size=${file.size}`);
    try {
      const payload: FileMessage = {
        type: MessageTypes.File,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        data: file.buffer.toString('base64')
      } as FileMessage;
      wsHub.sendTo(serial as string, payload);
      console.log(`[SEND-FILE] OK serial=${serial}`);
      res.json({ success: true, message: `File ${file.originalname} sent to ${serial}`, fileSize: file.size });
    } catch (error) {
      console.error(`[SEND-FILE] Error serial=${serial}`, error);
      res.status(500).json({ error: 'Failed to send file' });
    }
  }
}

const computerController = new ComputerController();
export const { lockMachine, shutdownMachine, restartMachine, notifyMachine, listMachines, getAll, getReport, getScreenshot, sendFileToMachine, setTakeScreenshots } = computerController;
export default computerController;
