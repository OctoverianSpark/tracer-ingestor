import type { Request, Response } from "express";
import path from "path";
import { appendFile, mkdir, readdir, readFile, rm } from "fs/promises";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

// Logs de ejecución que el agente sube cada 5 minutos (ver LogUploadWorker en ActiMetrics). Se
// guardan en disco, no en MySQL: son ~300 envíos por equipo y día y solo sirven para diagnosticar.
//   <AGENT_LOGS_PATH>/<appuser_id>/<YYYY-MM-DD Bogotá>.jsonl  — un envío por línea
// Equipos sin usuario asignado van a la carpeta del hostname, igual que las capturas.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENT_LOGS_DIR = path.resolve(process.env.AGENT_LOGS_PATH || path.join(__dirname, "../agent-logs"));
const RETENTION_DAYS = Number(process.env.AGENT_LOGS_RETENTION_DAYS) || 14;
const SAFE_SEGMENT = /^[a-zA-Z0-9_\-][a-zA-Z0-9_\-\.]*$/;
const BOGOTA_DATE = new Intl.DateTimeFormat("sv", { timeZone: "America/Bogota" });
const LEVELS = ["VRB", "DBG", "INF", "WRN", "ERR", "FTL"];
const MAX_ENTRIES = 5000;

interface LogEntry { ts: string; level: string; message: string }
interface LogBatch {
  received_at: string;
  machine: string;
  appuser_id: string | null;
  from: string | null;
  to: string | null;
  context: Record<string, unknown>;
  entries: LogEntry[];
  truncated?: number;
}

let lastCleanup = 0;

// Borra los días fuera de la retención. Como mucho una vez por hora, en segundo plano.
async function cleanupOldLogs() {
  if (Date.now() - lastCleanup < 3_600_000) return;
  lastCleanup = Date.now();
  const cutoff = BOGOTA_DATE.format(new Date(Date.now() - RETENTION_DAYS * 86_400_000));
  for (const owner of await readdir(AGENT_LOGS_DIR).catch(() => [] as string[])) {
    const dir = path.join(AGENT_LOGS_DIR, owner);
    for (const file of await readdir(dir).catch(() => [] as string[])) {
      if (file.endsWith(".jsonl") && file.slice(0, 10) < cutoff) await rm(path.join(dir, file), { force: true });
    }
  }
}

async function resolveOwner(appuserId: unknown, machine: string): Promise<string> {
  if (typeof appuserId === "string" && /^\d+$/.test(appuserId)) return appuserId;
  const computer = await prisma.computers.findUnique({ where: { hostname: machine }, select: { appuser_id: true } });
  return computer?.appuser_id != null ? String(computer.appuser_id) : machine;
}

export async function saveAgentLogs(req: Request, res: Response) {
  const body = req.body ?? {};
  const machine = body.machine;
  if (typeof machine !== "string" || !SAFE_SEGMENT.test(machine)) {
    return res.status(400).json({ error: "Missing or invalid machine" });
  }
  const rawEntries: unknown[] = Array.isArray(body.entries) ? body.entries : [];
  const entries: LogEntry[] = rawEntries
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map(e => ({ ts: String(e.ts ?? ""), level: String(e.level ?? "INF"), message: String(e.message ?? "") }));

  try {
    const owner = await resolveOwner(body.appuser_id, machine);
    const batch: LogBatch = {
      received_at: new Date().toISOString(),
      machine,
      appuser_id: owner === machine ? null : owner,
      from: typeof body.from === "string" ? body.from : null,
      to: typeof body.to === "string" ? body.to : null,
      context: body.context && typeof body.context === "object" ? body.context : {},
      entries: entries.slice(-MAX_ENTRIES),
      ...(entries.length > MAX_ENTRIES || body.truncated
        ? { truncated: (Number(body.truncated) || 0) + Math.max(0, entries.length - MAX_ENTRIES) }
        : {}),
    };
    const dir = path.join(AGENT_LOGS_DIR, owner);
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, `${BOGOTA_DATE.format(new Date())}.jsonl`), JSON.stringify(batch) + "\n", "utf8");
    cleanupOldLogs().catch(err => console.warn("[AGENT-LOGS] Limpieza falló", (err as Error).message));
    res.json({ ok: true, received: batch.entries.length });
  } catch (err) {
    console.error(`[AGENT-LOGS] Error machine=${machine}`, (err as Error).message);
    res.status(500).json({ error: "Failed to save logs" });
  }
}

// GET /tracer/logs?appuser_id=91&date=2026-11-20[&min_level=WRN][&machine=PC-ANA]
// `appuser_id` puede ser también un hostname (equipos sin usuario). Devuelve los envíos del día,
// más recientes primero; con min_level se descartan las entradas de menor nivel (el contexto de
// cada envío se conserva igual, sirve como latido).
export async function getAgentLogs(req: Request, res: Response) {
  const { appuser_id, date, min_level, machine } = req.query as Record<string, string | undefined>;
  if (!appuser_id || !SAFE_SEGMENT.test(appuser_id) || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Missing or invalid appuser_id or date" });
  }
  const minIdx = min_level ? Math.max(0, LEVELS.indexOf(min_level.toUpperCase())) : 0;
  const file = path.join(AGENT_LOGS_DIR, appuser_id, `${date}.jsonl`);
  try {
    const raw = await readFile(file, "utf8");
    const batches: LogBatch[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const b = JSON.parse(line) as LogBatch;
        if (machine && b.machine.toLowerCase() !== machine.toLowerCase()) continue;
        if (minIdx > 0) b.entries = b.entries.filter(e => LEVELS.indexOf(e.level) >= minIdx);
        batches.push(b);
      } catch { /* línea corrupta (escritura cortada): se ignora */ }
    }
    batches.reverse();
    res.json({ ok: true, batches });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return res.json({ ok: true, batches: [] });
    console.error(`[AGENT-LOGS] Error leyendo ${file}`, (err as Error).message);
    res.status(500).json({ error: "Failed to read logs" });
  }
}
