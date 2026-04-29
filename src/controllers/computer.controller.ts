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
    const { serial } = req.params;
    try {

      const computer = await this.service.getByUnique({ serial_number: String(serial) });
      if (!computer) {
        return res.status(404).json({ error: "Computer not found" });
      }

      const { id } = computer;

      await this.service.delete(id);
      res.json({ ok: true });
    } catch (error) {
      console.error("Error deleting computer:", error);
      res.status(500).json({ error: "Failed to delete computer" });
    }

  }
  async lockMachine(req: Request, res: Response) {
    const { serial } = req.params;
    const msg = createAction(ActionMessageTypes.Lock);
    console.log(msg);
    try {
      wsHub.sendTo(serial as string, msg as ActionMessage);
      res.json({ ok: true });
    } catch (err) {
      console.log(err);
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async notifyMachine(req: Request, res: Response) {
    const { serial } = req.params;
    const { title, message } = req.body as { title: string; message: string };
    try {
      console.log(title, message);
      const msg: WsMessage = {
        type: MessageTypes.Notification,
        title: title as string,
        text: message as string
      } as NotificationMessage;
      console.log(msg);
      wsHub.sendTo(serial as string, msg);
      res.json({ ok: true });
    } catch (error) {
      res.status(409).json({ error: "Maquina apagada o fuera de linea" });
    }
  }

  async listMachines(req: Request, res: Response) {
    try {
      const machines = await wsHub.listAll();
      res.json({ ok: true, machines: await Promise.all(machines) });
    } catch (error) {
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
      return res.status(400).json({ error: "Invalid computername" });
    }
    try {
      const allFiles = readdirSync(path.join(SCREENSHOTS_DIR, computername));
      const matched = allFiles.filter(file => file.includes(date));
      res.json({ ok: true, files: matched });
    } catch (ex) {
      console.error("[GET REPORT ERROR]", (ex as Error).message);
      res.status(500).json({ error: "Failed to read screenshots directory" });
    }
  }

  async getScreenshot(req: Request, res: Response) {
    try {
      const { filename, machine } = req.params as { filename: string; machine: string };
      if (!/^[a-zA-Z0-9_\-\.]+$/.test(machine) || !/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
        return res.status(400).json({ error: "Invalid path parameter" });
      }
      const files = readdirSync(path.join(SCREENSHOTS_DIR, machine));
      if (!files.includes(filename)) {
        res.status(404).json({ error: "Screenshot not found" });
        return;
      }
      const filePath = path.join(SCREENSHOTS_DIR, machine, filename);
      res.sendFile(filePath);
    } catch (err) {
      console.error("[GET SCREENSHOT ERROR]", (err as Error).message);
      res.status(500).json({ error: "Error reading screenshots" });
    }
  }

  async sendFileToMachine(req: Request, res: Response) {
    try {
      const { serial } = req.params;
      const file = req.file;
      console.log(serial);
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      if (!serial) {
        return res.status(400).json({ error: 'Machine serial required' });
      }
      const payload: FileMessage = {
        type: MessageTypes.File,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        data: file.buffer.toString('base64')
      } as FileMessage;
      wsHub.sendTo(serial as string, payload);
      res.json({
        success: true,
        message: `File ${file.originalname} sent to ${serial}`,
        fileSize: file.size
      });
    } catch (error) {
      console.error('Error sending file:', error);
      res.status(500).json({ error: 'Failed to send file' });
    }
  }
}

const computerController = new ComputerController();
export const { lockMachine, notifyMachine, listMachines, getAll, getReport, getScreenshot, sendFileToMachine } = computerController;
export default computerController;
