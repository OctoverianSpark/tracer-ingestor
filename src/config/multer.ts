import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Request, Response } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Cambia a memoryStorage para interceptar el buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function saveScreenShot(req: Request, res: Response) {
  try {
    const file = req.file;
    const machine = req.body?.machine as string;
    const user = req.body?.user as string;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!machine || !user) {
      res.status(400).json({ error: "Missing machine or user fields" });
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}-${machine}-${user}.jpg`;
    const savePath = path.join(SCREENSHOTS_DIR, filename);

    // Comprime antes de guardar
    await sharp(file.buffer)
      .jpeg({ quality: 60 })
      .toFile(savePath);

    console.log(`[SCREENSHOT SAVED] ${savePath}`);
    res.status(200).json({ message: "Screenshot saved", filename });
  } catch (ex) {
    console.error(`[SCREENSHOT ERROR] ${(ex as Error).message}`);
    res.status(500).json({ error: "Failed to save screenshot" });
  }
}