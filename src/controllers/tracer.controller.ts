import type { Request, Response } from "express";
import { state_log_type, programation, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import Controller from "./controller.js";
import programationService, { type ProgramationService } from "../services/schedules/programation.service.js";
import { INSTALLERS_DIR } from "../config/multer.js";

const typeMap: Record<number, state_log_type> = {
  0: "auto",
  1: "manual"
};

function computeSha256(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex").toUpperCase();
}

function getSha256(filePath: string): string {
  const sidecar = `${filePath}.sha256`;
  if (fs.existsSync(sidecar)) return fs.readFileSync(sidecar, "utf8").trim().toUpperCase();
  const sha256 = computeSha256(filePath);
  fs.writeFileSync(sidecar, sha256, "utf8");
  return sha256;
}

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
      where: { computer_id: BigInt(computer_id as string) },
      include: { state: true, category: true }
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
        where: { hostname: workerId },
        include: { appuser: { select: { group_id: true } } }
      });
      console.log("[states] computer encontrado:", computer ? `id=${computer.id} hostname=${computer.hostname}` : "null");
      if (!computer) return res.status(404).json({ error: "Computer not found" });

      const groupId = computer.appuser?.group_id ?? null;
      const [defaultStates, groupStates] = await Promise.all([
        prisma.states.findMany({ where: { group_id: null } }),
        groupId !== null ? prisma.states.findMany({ where: { group_id: groupId } }) : Promise.resolve([])
      ]);
      // El catálogo por grupo puede ser parcial (solo customiza algunos codes):
      // parte del default y superpone las entradas del grupo, en vez de reemplazo total.
      const statesByCode = new Map(defaultStates.map(s => [s.code, s]));
      for (const s of groupStates) statesByCode.set(s.code, s);

      // La categoría se deriva del estado (states.category_id), no del código "Category" del agente.
      const rows: Prisma.state_logsUncheckedCreateInput[] = [];
      for (const log of payload) {
        const type = typeMap[log.Type];
        const state = statesByCode.get(log.State);
        if (!state || !type) {
          console.warn(`[states] descartando registro con enum desconocido: State=${log.State} Type=${log.Type} computer_id=${computer.id}`);
          continue;
        }
        rows.push({
          computer_id: computer.id,
          user_name: log.WorkerUserName,
          code: log.State,
          state_id: state.id,
          category_id: state.category_id,
          type,
          timestamp: new Date(log.Timestamp)
        });
      }

      console.log("[states] insertando", rows.length, "de", payload.length, "registros");
      if (rows.length > 0) await prisma.state_logs.createMany({ data: rows });

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
        ActiveSeconds?: number;
        IdleSeconds?: number;
        MouseClicks?: number;
        Keystrokes?: number;
      }[];

      const workerId = payload[0]?.WorkerId;
      if (!workerId) return res.status(400).json({ error: "No WorkerId" });

      const computer = await prisma.computers.findFirst({
        where: { hostname: workerId }
      });
      if (!computer) return res.status(404).json({ error: "Computer not found" });

      await prisma.app_usage_logs.createMany({
        data: payload.map(log => ({
          computer_id:    computer.id,
          interval_start: new Date(log.IntervalStart),
          interval_end:   new Date(log.IntervalEnd),
          apps:           JSON.parse(log.Apps),
          active_seconds: log.ActiveSeconds ?? 0,
          idle_seconds:   log.IdleSeconds   ?? 0,
          mouse_clicks:   log.MouseClicks   ?? 0,
          keystrokes:     log.Keystrokes    ?? 0,
        }))
      });

      res.json({ ok: true, count: payload.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to sync app usage" });
    }
  }

  async getPermissions(req: Request, res: Response) {
    const { serial } = req.query as { serial: string };
    if (!serial) return res.status(400).json({ error: "Missing serial" });
    const computer = await prisma.computers.findUnique({
      where: { serial_number: serial },
      select: { take_screenshots: true }
    });
    if (!computer) return res.status(404).json({ error: "Computer not found" });
    res.json({ ok: true, take_screenshots: computer.take_screenshots });
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

  // "package": el .nupkg que necesita el canal de auto-actualización de Velopack (releases.win.json).
  // "installer": el ejecutable que un humano corre para instalar de cero en un equipo nuevo — el
  // Setup.exe del agente Tracer, no el del Host (GoTracer.Host.Setup-x.x.x.exe, instalador aparte)
  // ni el nupkg (no es ejecutable de primera instalación por sí solo).
  private pickInstallerFile(files: string[], kind: "package" | "installer"): string {
    if (kind === "installer") {
      const exe = files.find((f: string) => /-setup\.exe$/i.test(f) && !/\.host\./i.test(f));
      if (exe) return exe;
    }
    return files.find((f: string) => f.toLowerCase().endsWith(".nupkg")) ?? files[0]!;
  }

  private resolveInstaller(version?: string, kind: "package" | "installer" = "package"): { version: string; filePath: string; filename: string; stat: fs.Stats; sha256: string } | null {
    console.log(`[updates] resolveInstaller — buscando en: ${INSTALLERS_DIR}${version ? ` | versión solicitada: ${version}` : " | versión más reciente"} | tipo: ${kind}`);

    const entries = fs.readdirSync(INSTALLERS_DIR).filter((f: string) => !f.startsWith("."));

    // Archivos directamente en installers/ — extrae versión del nombre (ej: ActiMetrics-1.10.0-full.nupkg)
    type FlatEntry = { version: string; filename: string; filePath: string; stat: fs.Stats; sha256: string };
    const flatFiles: FlatEntry[] = entries
      .filter((f: string) => fs.statSync(path.join(INSTALLERS_DIR, f)).isFile() && !f.endsWith(".sha256"))
      .flatMap((f: string) => {
        const match = f.match(/(\d+\.\d+(?:\.\d+)*)/);
        if (!match) return [];
        const filePath = path.join(INSTALLERS_DIR, f);
        return [{ version: match[1]!, filename: f, filePath, stat: fs.statSync(filePath), sha256: getSha256(filePath) }];
      })
      .sort((a: FlatEntry, b: FlatEntry) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: "base" }));

    // Subcarpetas de versión (ej: installers/1.10.0/ActiMetrics-1.10.0-full.nupkg)
    const versionFolders = entries
      .filter((f: string) => fs.statSync(path.join(INSTALLERS_DIR, f)).isDirectory())
      .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }));

    console.log(`[updates] carpetas: [${versionFolders.join(", ") || "ninguna"}] | archivos planos: [${flatFiles.map((f: FlatEntry) => f.filename).join(", ") || "ninguno"}]`);

    // Busca primero en subcarpetas, luego en archivos planos
    const folderTargets = version ? versionFolders.filter((v: string) => v === version) : versionFolders;
    for (const v of folderTargets) {
      const files = fs.readdirSync(path.join(INSTALLERS_DIR, v))
        .filter((f: string) => !f.startsWith(".") && !f.endsWith(".sha256"));
      if (files.length > 0) {
        // Un directorio de release trae varios artefactos (Setup.exe, full.nupkg, Host.Setup.exe) —
        // sin elegir por tipo, el primer archivo por orden alfabético podía no ser el correcto para
        // el caso de uso (ej. Velopack recibiendo un .exe en vez del .nupkg, y no lo aplicaba como
        // versión instalada — el agente veía "hay actualización" en cada chequeo sin parar).
        const filename = this.pickInstallerFile(files, kind);
        const filePath = path.join(INSTALLERS_DIR, v, filename);
        const stat = fs.statSync(filePath);
        const sha256 = getSha256(filePath);
        console.log(`[updates] instalador encontrado (carpeta) — versión: ${v} | archivo: ${filename} | sha256: ${sha256.slice(0, 8)}...`);
        return { version: v, filePath, filename, stat, sha256 };
      }
    }

    const flatTargets = version ? flatFiles.filter((f: FlatEntry) => f.version === version) : flatFiles;
    if (flatTargets.length > 0) {
      // Mismo criterio que arriba: varios archivos planos pueden compartir la misma versión
      // (Setup.exe y full.nupkg sueltos en installers/) — elegir según el tipo pedido.
      const topVersion = flatTargets[0]!.version;
      const sameVersion = flatTargets.filter((f: FlatEntry) => f.version === topVersion);
      const filename = this.pickInstallerFile(sameVersion.map((f: FlatEntry) => f.filename), kind);
      const f = sameVersion.find((f: FlatEntry) => f.filename === filename) ?? sameVersion[0]!;
      console.log(`[updates] instalador encontrado (plano) — versión: ${f.version} | archivo: ${f.filename}`);
      return f;
    }

    console.warn(`[updates] no se encontró instalador${version ? ` para la versión "${version}"` : ""}`);
    return null;
  }

  async getUpdateInfo(req: Request, res: Response) {
    const requestedVersion = req.query.version as string | undefined;
    console.log(`[updates] GET /updates — consulta de info${requestedVersion ? ` | versión: ${requestedVersion}` : " | sin versión especificada (más reciente)"} | ip: ${req.ip}`);
    try {
      const installer = this.resolveInstaller(requestedVersion, "installer");
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
      const installer = this.resolveInstaller(requestedVersion, "installer");
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
    const { id, rid } = req.query as Record<string, string>;
    console.log(`[updates] GET /updates/releases.win.json — id: ${id} | rid: ${rid} | ip: ${req.ip}`);
    try {
      const installer = this.resolveInstaller();
      if (!installer) {
        console.log("[updates] sin instaladores — devolviendo Assets vacío");
        return res.json({ Assets: [] });
      }

      const packageId = id ?? installer.filename.split("-")[0] ?? "App";
      console.log(`[updates] manifest Velopack — PackageId: ${packageId} | Version: ${installer.version} | FileName: ${installer.filename} | SHA256: ${installer.sha256.slice(0, 8)}...`);
      return res.json({
        Assets: [
          {
            PackageId: packageId,
            Version: installer.version,
            Type: "Full",
            FileName: installer.filename,
            SHA256: installer.sha256,
            Size: installer.stat.size,
          }
        ]
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
    const sha256 = getSha256(req.file.path);
    console.log(`[updates] archivo recibido: ${req.file.filename} | tamaño: ${req.file.size} bytes | sha256: ${sha256} | destino: ${req.file.path}`);
    return res.status(200).json({ ok: true, version, filename: req.file.filename, size: req.file.size, sha256 });
  }
}

const tracerController = new TracerController();
export const { getStateLogs, syncStates, syncAppUsage, pingData, ProgramationSave, GetProgramations, GetSchedules, SchedulePersonal, getUpdateInfo, downloadUpdate, uploadUpdate, getReleaseManifest, downloadPackage, getPermissions } = tracerController;
export default tracerController;
