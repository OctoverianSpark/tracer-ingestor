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
  1: "break",
  2: "wc",
  3: "lunch",
  4: "idle",
  5: "offline"
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

      const workerId = payload[0]?.WorkerId;
      if (!workerId) return res.status(400).json({ error: "No WorkerId" });

      const computer = await prisma.computers.findFirst({
        where: { hostname: workerId }
      });
      if (!computer) return res.status(404).json({ error: "Computer not found" });

      const rows = payload.map(log => {
        const state = stateMap[log.State];
        const category = categoryMap[log.Category];
        const type = typeMap[log.Type];
        if (!state || !category || !type) throw new Error(`Unknown enum value in log: State=${log.State} Category=${log.Category} Type=${log.Type}`);
        return { computer_id: computer.id, user_name: log.WorkerUserName, state, category, type, timestamp: new Date(log.Timestamp) };
      });

      await prisma.state_logs.createMany({ data: rows });

      res.json({ ok: true, count: payload.length });
    } catch (err) {
      console.error(err);
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

  async getUpdateInfo(_req: Request, res: Response) {
    try {
      const files = fs.readdirSync(INSTALLERS_DIR).filter(f => !f.startsWith("."));
      if (files.length === 0) return res.status(404).json({ error: "No installer available" });

      const latest = files
        .map(f => ({ name: f, stat: fs.statSync(path.join(INSTALLERS_DIR, f)) }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
        .at(0);

      if (!latest) return res.status(404).json({ error: "No installer available" });

      return res.json({
        ok: true,
        filename: latest.name,
        size: latest.stat.size,
        updatedAt: latest.stat.mtime,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read installer info" });
    }
  }

  async downloadUpdate(_req: Request, res: Response) {
    try {
      const files = fs.readdirSync(INSTALLERS_DIR).filter(f => !f.startsWith("."));
      if (files.length === 0) return res.status(404).json({ error: "No installer available" });

      const latest = files
        .map(f => ({ name: f, mtime: fs.statSync(path.join(INSTALLERS_DIR, f)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .at(0);

      if (!latest) return res.status(404).json({ error: "No installer available" });

      return res.download(path.join(INSTALLERS_DIR, latest.name), latest.name);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to serve installer" });
    }
  }

  async uploadUpdate(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    return res.status(200).json({ ok: true, filename: req.file.filename, size: req.file.size });
  }
}

const tracerController = new TracerController();
export const { getStateLogs, syncStates, syncAppUsage, pingData, ProgramationSave, GetProgramations, GetSchedules, SchedulePersonal, getUpdateInfo, downloadUpdate, uploadUpdate } = tracerController;
export default tracerController;
