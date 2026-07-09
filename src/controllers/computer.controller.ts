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

  /** "*" y "group:<id>" engloban varias máquinas; cualquier otro valor es un serial puntual. */
  private isBatchTarget(target: string): boolean {
    return target === "*" || target.startsWith("group:");
  }

  private async resolveSerials(target: string): Promise<string[]> {
    if (target === "*") {
      const computers = await prisma.computers.findMany({
        where: { serial_number: { not: null } },
        select: { serial_number: true }
      });
      return computers.map(c => c.serial_number!);
    }

    if (target.startsWith("group:")) {
      const groupId = Number(target.slice("group:".length));
      if (!Number.isInteger(groupId)) return [];
      const computers = await prisma.computers.findMany({
        where: { appuser: { group_id: groupId }, serial_number: { not: null } },
        select: { serial_number: true }
      });
      return computers.map(c => c.serial_number!);
    }

    return [target];
  }

  private async runBatch(target: string, action: (serial: string) => unknown) {
    const serials = await this.resolveSerials(target);
    return Promise.all(serials.map(async serial => {
      try {
        await action(serial);
        return { serial, ok: true };
      } catch (err: any) {
        return { serial, ok: false, error: err?.message ?? "Unknown error" };
      }
    }));
  }

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
    const { serial } = req.params as { serial: string };
    console.log(`[LOCK] target=${serial}`);
    const msg = createAction(ActionMessageTypes.Lock);

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, msg as ActionMessage);
        console.log(`[LOCK] OK serial=${serial}`);
        return res.json({ ok: true });
      } catch (err) {
        console.error(`[LOCK] Error serial=${serial}`, err);
        return res.status(409).json({ error: "Maquina apagada o fuera de linea" });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, msg as ActionMessage));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[LOCK] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, sent: results.length - failed.length, failed: failed.length, results });
  }

  async shutdownMachine(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    console.log(`[SHUTDOWN] target=${serial}`);
    const msg = createAction(ActionMessageTypes.Shutdown);

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, msg as ActionMessage);
        console.log(`[SHUTDOWN] OK serial=${serial}`);
        return res.json({ ok: true });
      } catch (err) {
        console.error(`[SHUTDOWN] Error serial=${serial}`, err);
        return res.status(409).json({ error: "Maquina apagada o fuera de linea" });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, msg as ActionMessage));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[SHUTDOWN] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, sent: results.length - failed.length, failed: failed.length, results });
  }

  async restartMachine(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    console.log(`[RESTART] target=${serial}`);
    const msg = createAction(ActionMessageTypes.Restart);

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, msg as ActionMessage);
        console.log(`[RESTART] OK serial=${serial}`);
        return res.json({ ok: true });
      } catch (err) {
        console.error(`[RESTART] Error serial=${serial}`, err);
        return res.status(409).json({ error: "Maquina apagada o fuera de linea" });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, msg as ActionMessage));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[RESTART] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, sent: results.length - failed.length, failed: failed.length, results });
  }

  async notifyMachine(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    const { title, message } = req.body as { title: string; message: string };
    console.log(`[NOTIFY] target=${serial} title="${title}"`);
    const msg: WsMessage = {
      type: MessageTypes.Notification,
      title: title as string,
      text: message as string
    } as NotificationMessage;

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, msg);
        console.log(`[NOTIFY] OK serial=${serial}`);
        return res.json({ ok: true });
      } catch (error) {
        console.error(`[NOTIFY] Error serial=${serial}`, error);
        return res.status(409).json({ error: "Maquina apagada o fuera de linea" });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, msg));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[NOTIFY] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, sent: results.length - failed.length, failed: failed.length, results });
  }

  async syncMachine(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    console.log(`[SYNC] target=${serial}`);
    const msg = createAction(ActionMessageTypes.Sync);

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, msg as ActionMessage);
        console.log(`[SYNC] OK serial=${serial}`);
        return res.json({ ok: true });
      } catch (err) {
        console.error(`[SYNC] Error serial=${serial}`, err);
        return res.status(409).json({ error: "Maquina apagada o fuera de linea" });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, msg as ActionMessage));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[SYNC] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, sent: results.length - failed.length, failed: failed.length, results });
  }

  async setTakeScreenshots(req: Request, res: Response) {
    const { serial } = req.params as { serial: string };
    const { enabled } = req.body as { enabled: boolean };
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be boolean" });
    }
    console.log(`[TAKE-SCREENSHOTS] target=${serial} enabled=${enabled}`);

    if (!this.isBatchTarget(serial)) {
      try {
        await this.service.setTakeScreenshots(serial, enabled);
        return res.json({ ok: true, serial, take_screenshots: enabled });
      } catch (error: any) {
        if (error?.code === "P2025") {
          return res.status(404).json({ error: "Computer not found" });
        }
        console.error(`[TAKE-SCREENSHOTS] Error serial=${serial}`, error);
        return res.status(500).json({ error: "Failed to update permission" });
      }
    }

    const results = await this.runBatch(serial, s => this.service.setTakeScreenshots(s, enabled));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[TAKE-SCREENSHOTS] batch target=${serial} updated=${results.length - failed.length} failed=${failed.length}`);
    res.json({ ok: failed.length === 0, take_screenshots: enabled, sent: results.length - failed.length, failed: failed.length, results });
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
    const { serial } = req.params as { serial: string };
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    if (!serial) {
      return res.status(400).json({ error: 'Machine serial required' });
    }
    console.log(`[SEND-FILE] target=${serial} file="${file.originalname}" size=${file.size}`);
    const payload: FileMessage = {
      type: MessageTypes.File,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      data: file.buffer.toString('base64')
    } as FileMessage;

    if (!this.isBatchTarget(serial)) {
      try {
        wsHub.sendTo(serial, payload);
        console.log(`[SEND-FILE] OK serial=${serial}`);
        return res.json({ success: true, message: `File ${file.originalname} sent to ${serial}`, fileSize: file.size });
      } catch (error) {
        console.error(`[SEND-FILE] Error serial=${serial}`, error);
        return res.status(500).json({ error: 'Failed to send file' });
      }
    }

    const results = await this.runBatch(serial, s => wsHub.sendTo(s, payload));
    if (results.length === 0) return res.status(404).json({ error: "No matching machines found" });
    const failed = results.filter(r => !r.ok);
    console.log(`[SEND-FILE] batch target=${serial} sent=${results.length - failed.length} failed=${failed.length}`);
    res.json({ success: failed.length === 0, fileSize: file.size, sent: results.length - failed.length, failed: failed.length, results });
  }

  /** Empuja el inventario de computers hacia el endpoint push de HelpDESK (POST /api/tracer/sync). */
  async syncToHelpdesk(req: Request, res: Response) {
    const url = process.env.HELPDESK_SYNC_URL;
    const apiKey = process.env.HELPDESK_SYNC_API_KEY;

    if (!url || !apiKey) {
      return res.status(500).json({ ok: false, error: "HELPDESK_SYNC_URL / HELPDESK_SYNC_API_KEY no configurados" });
    }

    try {
      const machines = await prisma.computers.findMany({
        where: { serial_number: { not: null } },
        select: { serial_number: true, hostname: true, machineBrand: true, machineModel: true }
      });

      console.log(`[SYNC-HELPDESK] Enviando ${machines.length} equipos a HelpDESK`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
        body: JSON.stringify({ machines })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(`[SYNC-HELPDESK] HelpDESK respondio ${response.status}`, data);
        return res.status(502).json({ ok: false, error: "HelpDESK rechazo la sincronizacion", helpdesk: data });
      }

      console.log(`[SYNC-HELPDESK] OK, ${machines.length} equipos enviados`);
      res.json({ ok: true, sent: machines.length, helpdesk: data });
    } catch (error: any) {
      console.error("[SYNC-HELPDESK] Error", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}

const computerController = new ComputerController();
export const { lockMachine, shutdownMachine, restartMachine, notifyMachine, syncMachine, listMachines, getAll, getReport, getScreenshot, sendFileToMachine, setTakeScreenshots, syncToHelpdesk } = computerController;
export default computerController;
