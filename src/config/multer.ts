import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(process.env.SCREENSHOTS_PATH || path.join(__dirname, "../screenshots"));

export const INSTALLERS_DIR = path.join(process.env.INSTALLERS_PATH || path.join(__dirname, "../installers"));
if (!fs.existsSync(INSTALLERS_DIR)) {
  fs.mkdirSync(INSTALLERS_DIR, { recursive: true });
}

export const uploadInstaller = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const version = (req.query.version as string) || "unversioned";
      const dir = path.join(INSTALLERS_DIR, version);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => cb(null, file.originalname),
  }),
  limits: { fileSize: 512 * 1024 * 1024 },
});

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Cambia a memoryStorage para interceptar el buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 128 * 1024 * 1024 },
});

const SAFE_SEGMENT = /^[a-zA-Z0-9_\-][a-zA-Z0-9_\-\.]*$/;

// Las capturas se guardan por USUARIO (<SCREENSHOTS_DIR>/<appuser_id>/), no por equipo: así una
// persona con varios equipos ve todo junto, y en una VM compartida por RDP cada usuario tiene lo
// suyo aunque el hostname sea el mismo. El agente nuevo manda `appuser_id`; los agentes viejos
// solo mandan `machine` (hostname) y se resuelve con el usuario asignado a ese equipo.
async function resolveScreenshotOwner(appuserId: string | undefined, machine: string): Promise<string | null> {
  if (appuserId && /^\d+$/.test(appuserId)) return appuserId;
  const computer = await prisma.computers.findUnique({ where: { hostname: machine }, select: { appuser_id: true } });
  return computer?.appuser_id != null ? String(computer.appuser_id) : null;
}

export async function saveScreenShot(req: Request, res: Response) {
  try {
    const file = req.file;
    const machine = req.body?.machine as string;
    const appuserId = req.body?.appuser_id as string | undefined;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!machine || !SAFE_SEGMENT.test(machine)) {
      res.status(400).json({ error: "Missing or invalid machine field" });
      return;
    }

    // Equipo sin usuario asignado (y agente viejo): se guarda en la carpeta del hostname como antes
    // para no perderla; scripts/migrate-screenshots-to-users.ts la mueve cuando se le asigne usuario.
    const owner = await resolveScreenshotOwner(appuserId, machine);
    if (!owner) console.warn(`[SCREENSHOT] Sin usuario para machine=${machine}, se guarda por hostname`);

    const dir = path.join(SCREENSHOTS_DIR, owner ?? machine);
    fs.mkdirSync(dir, { recursive: true });
    // <timestamp UTC>_<hostname>_MonitorN.jpg — el timestamp va primero (get-report filtra por
    // prefijo) y el hostname conserva de qué equipo salió ahora que la carpeta es del usuario.
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const monitor = file.originalname.split('_').find(name => name.includes('Monitor'));
    const filename = `${timestamp}_${machine}_${monitor}`;
    const savePath = path.join(dir, filename);

    // Comprime antes de guardar
    await sharp(file.buffer)
      .jpeg({ quality: 60 })
      .toFile(savePath);

    // Miniatura para la galería del dashboard (ver getScreenshot ?thumb=1). Best-effort: si falla
    // se genera on-demand la primera vez que se pida.
    try {
      const thumbDir = path.join(dir, "thumbs");
      fs.mkdirSync(thumbDir, { recursive: true });
      await sharp(file.buffer)
        .resize({ width: 400, withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toFile(path.join(thumbDir, filename));
    } catch (thumbErr) {
      console.warn(`[SCREENSHOT] No se pudo generar miniatura de ${filename}`, (thumbErr as Error).message);
    }

    console.log(`[SCREENSHOT SAVED] ${savePath}`);
    res.status(200).json({ message: "Screenshot saved", filename });
  } catch (ex) {
    console.error(`[SCREENSHOT ERROR] ${(ex as Error).message}`);
    res.status(500).json({ error: "Failed to save screenshot" });
  }
}
