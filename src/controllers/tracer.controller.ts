import type { Request, Response } from "express";
import { state_log_category, state_log_state, state_log_type, programation } from "@prisma/client";
import path from "path";
import fs from "fs";
import prisma from "../lib/prisma.js";
import Controller from "./controller.js";
import programationService, { type ProgramationService } from "../services/schedules/programation.service.js";
import { INSTALLERS_DIR } from "../config/multer.js";

const stateMap: Record<number, state_log_state> = {
  0: "working",
  1: "overtime",
  2: "break",
  3: "wc",
  4: "lunch",
  5: "idle",
  6: "offline"
};

const categoryMap: Record<number, state_log_category> = {
  0: "active",
  1: "neutral",
  2: "inactive"
};

const typeMap: Record<number, state_log_type> = {
  0: "auto",
  1: "manual"
};

function isNewerVersion(available: string, current: string): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const [a, b] = [parse(available), parse(current)];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

class TracerController extends Controller<ProgramationService> {
  protected service = programationService;

  async getStateLogs(req: Request, res: Response) {
    const { computer_id } = req.query;
    if (!computer_id) return res.status(400).json({ error: "Missing computer_id" });
    const data = await prisma.state_logs.findMany({
      where: { computer_id: BigInt(computer_id as string) }
    });
    return res.status(200).json({ ok: true, data });
  }

  async syncStates(req: Request, res: Response) {
    try {
      const payload = req.body as {
        WorkerId: string;
        WorkerUserName: string;
        Category: number;
        State: number;
        Type: number;
        Timestamp: string;
      }[];

      console.log("[states] body recibido:", JSON.stringify(req.body));

      const workerId = payload[0]?.WorkerId;
      console.log("[states] workerId extraído:", workerId);
      if (!workerId) return res.status(400).json({ error: "No WorkerId" });

      const computer = await prisma.computers.findFirst({
        where: { hostname: workerId }
      });
      console.log("[states] computer encontrado:", computer ? `id=${computer.id} hostname=${computer.hostname}` : "null");
      if (!computer) return res.status(404).json({ error: "Computer not found" });

      const rows = payload.map(log => {
        const state = stateMap[log.State];
        const category = categoryMap[log.Category];
        const type = typeMap[log.Type];
        if (!state || !category || !type) throw new Error(`Unknown enum value in log: State=${log.State} Category=${log.Category} Type=${log.Type}`);
        return { computer_id: computer.id, user_name: log.WorkerUserName, state, category, type, timestamp: new Date(log.Timestamp) };
      });

      console.log("[states] insertando", rows.length, "registros");
      await prisma.state_logs.createMany({ data: rows });

      res.json({ ok: true, count: payload.length });
    } catch (err) {
      console.error("[states] error:", err);
      res.status(500).json({ error: "Failed to sync states" });
    }
  }

  async syncAppUsage(req: Request, res: Response) {
    try {
      const payload = req.body as {
        WorkerId: string;
        WorkerUserName: string;
        IntervalStart: string;
        IntervalEnd: string;
        Apps: string;
      }[];

      const workerId = payload[0]?.WorkerId;
      console.log(workerId);
      if (!workerId) return res.status(400).json({ error: "No WorkerId" });

      const computer = await prisma.computers.findFirst({
        where: { hostname: workerId }
      });
      if (!computer) return res.status(404).json({ error: "Computer not found" });

      await prisma.app_usage_logs.createMany({
        data: payload.map(log => ({
          computer_id: computer.id,
          interval_start: new Date(log.IntervalStart),
          interval_end: new Date(log.IntervalEnd),
          apps: JSON.parse(log.Apps)
        }))
      });

      res.json({ ok: true, count: payload.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to sync app usage" });
    }
  }

  async pingData(_req: Request, res: Response) {
    console.log("API CONNECTED WITH TRACER");
    res.json({ msg: { text: "Hello" } });
  }

  async ProgramationSave(req: Request, res: Response) {
    const data = req.body as programation;
    console.log(data);
    const saved = await this.service.save(data);
    res.status(201).json(saved);
  }

  async GetProgramations(_req: Request, res: Response) {
    const data = await this.service.getAll();
    res.json({ ok: true, data });
  }

  async GetSchedules(_req: Request, res: Response) {
    const data = await prisma.schedules.findMany();
    res.json({ ok: true, data });
  }

  async SchedulePersonal(_req: Request, res: Response) {
    res.status(501).json({ error: "Not implemented" });
  }

  private resolveInstaller(version?: string): { version: string; filePath: string; filename: string; stat: fs.Stats } | null {
    console.log(`[updates] resolveInstaller — buscando en: ${INSTALLERS_DIR}${version ? ` | versión solicitada: ${version}` : " | versión más reciente"}`);

    const versionFolders = fs.readdirSync(INSTALLERS_DIR)
      .filter(f => !f.startsWith(".") && fs.statSync(path.join(INSTALLERS_DIR, f)).isDirectory())
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }));

    console.log(`[updates] carpetas de versiones disponibles: [${versionFolders.join(", ") || "ninguna"}]`);

    const targets = version ? versionFolders.filter(v => v === version) : versionFolders;

    for (const v of targets) {
      const files = fs.readdirSync(path.join(INSTALLERS_DIR, v)).filter(f => !f.startsWith("."));
      if (files.length > 0) {
        const filename = files[0]!;
        const filePath = path.join(INSTALLERS_DIR, v, filename);
        const stat = fs.statSync(filePath);
        console.log(`[updates] instalador encontrado — versión: ${v} | archivo: ${filename} | tamaño: ${stat.size} bytes | modificado: ${stat.mtime.toISOString()}`);
        return { version: v, filePath, filename, stat };
      }
    }

    console.warn(`[updates] no se encontró instalador${version ? ` para la versión "${version}"` : ""}`);
    return null;
  }

  async getUpdateInfo(req: Request, res: Response) {
    const requestedVersion = req.query.version as string | undefined;
    console.log(`[updates] GET /updates — consulta de info${requestedVersion ? ` | versión: ${requestedVersion}` : " | sin versión especificada (más reciente)"} | ip: ${req.ip}`);
    try {
      const installer = this.resolveInstaller(requestedVersion);
      if (!installer) return res.status(404).json({ error: "No installer available" });

      console.log(`[updates] respondiendo info: versión=${installer.version} | archivo=${installer.filename} | tamaño=${installer.stat.size}`);
      return res.json({
        ok: true,
        version: installer.version,
        filename: installer.filename,
        size: installer.stat.size,
        updatedAt: installer.stat.mtime,
      });
    } catch (err) {
      console.error("[updates] error al leer info del instalador:", err);
      return res.status(500).json({ error: "Failed to read installer info" });
    }
  }

  async downloadUpdate(req: Request, res: Response) {
    const requestedVersion = req.query.version as string | undefined;
    console.log(`[updates] GET /updates/download — solicitud de descarga${requestedVersion ? ` | versión: ${requestedVersion}` : " | versión más reciente"} | ip: ${req.ip}`);
    try {
      const installer = this.resolveInstaller(requestedVersion);
      if (!installer) return res.status(404).json({ error: "No installer available" });

      console.log(`[updates] iniciando envío de archivo: ${installer.filename} (${installer.stat.size} bytes) desde ${installer.filePath}`);
      res.on("finish", () => console.log(`[updates] descarga completada: ${installer.filename} → ip: ${req.ip}`));
      return res.download(installer.filePath, installer.filename);
    } catch (err) {
      console.error("[updates] error al servir instalador:", err);
      return res.status(500).json({ error: "Failed to serve installer" });
    }
  }

  async getReleaseManifest(req: Request, res: Response) {
    const { localVersion, rid } = req.query as Record<string, string>;
    console.log(`[updates] GET /updates/releases.win.json — rid: ${rid} | localVersion: ${localVersion} | ip: ${req.ip}`);
    try {
      const installer = this.resolveInstaller();
      if (!installer) return res.status(404).json({ error: "No installer available" });

      if (localVersion && !isNewerVersion(installer.version, localVersion)) {
        console.log(`[updates] cliente actualizado — local: ${localVersion} | disponible: ${installer.version}`);
        return res.json({ ok: true, upToDate: true });
      }

      console.log(`[updates] nueva versión disponible: ${installer.version} | archivo: ${installer.filename}`);
      return res.json({
        ok: true,
        version: installer.version,
        filename: installer.filename,
        size: installer.stat.size,
        updatedAt: installer.stat.mtime,
      });
    } catch (err) {
      console.error("[updates] error en getReleaseManifest:", err);
      return res.status(500).json({ error: "Failed to read release manifest" });
    }
  }

  async downloadPackage(req: Request, res: Response) {
    const { filename } = req.params as { filename: string };
    console.log(`[updates] GET /updates/${filename} — descarga de paquete | ip: ${req.ip}`);
    try {
      const versionFolders = fs.readdirSync(INSTALLERS_DIR)
        .filter((f: string) => !f.startsWith(".") && fs.statSync(path.join(INSTALLERS_DIR, f)).isDirectory());

      for (const v of versionFolders) {
        const filePath = path.join(INSTALLERS_DIR, v, filename);
        if (fs.existsSync(filePath)) {
          console.log(`[updates] sirviendo paquete: ${filename} | versión: ${v}`);
          res.on("finish", () => console.log(`[updates] descarga completada: ${filename} → ip: ${req.ip}`));
          return res.download(filePath, filename);
        }
      }

      console.warn(`[updates] paquete no encontrado: ${filename}`);
      return res.status(404).json({ error: "Package not found" });
    } catch (err) {
      console.error("[updates] error al servir paquete:", err);
      return res.status(500).json({ error: "Failed to serve package" });
    }
  }

  async uploadUpdate(req: Request, res: Response) {
    const version = (req.query.version as string) || "unversioned";
    console.log(`[updates] POST /updates — subida de instalador | versión: ${version} | ip: ${req.ip}`);
    if (!req.file) {
      console.warn("[updates] subida rechazada: no se recibió archivo");
      return res.status(400).json({ error: "No file provided" });
    }
    console.log(`[updates] archivo recibido: ${req.file.filename} | tamaño: ${req.file.size} bytes | destino: ${req.file.path}`);
    return res.status(200).json({ ok: true, version, filename: req.file.filename, size: req.file.size });
  }
}

const tracerController = new TracerController();
export const { getStateLogs, syncStates, syncAppUsage, pingData, ProgramationSave, GetProgramations, GetSchedules, SchedulePersonal, getUpdateInfo, downloadUpdate, uploadUpdate, getReleaseManifest, downloadPackage } = tracerController;
export default tracerController;
