import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import Controller from "./controller.js";
import lunchSkipsService, { type LunchSkipsService } from "../services/lunch_skips.service.js";

class LunchSkipsController extends Controller<LunchSkipsService> {
  protected service = lunchSkipsService;

  // from/to (rango) y appuser_id no encajan en el parseQuery numérico genérico de Controller —
  // se leen directo, mismo criterio que app_usage_logs.controller.ts findByDate.
  async getAll(req: Request, res: Response) {
    try {
      const { appuser_id, from, to } = req.query as Record<string, string | undefined>;
      const where: Prisma.lunch_skipsWhereInput = {};
      if (appuser_id) where.appuser_id = BigInt(appuser_id);
      if (from || to) {
        where.date = {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        };
      }
      const data = await this.service.getAll(undefined, undefined, where);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const { appuser_id, date } = req.body as { appuser_id?: number | string; date?: string };
      if (!appuser_id || !date) {
        res.status(400).json({ ok: false, error: "appuser_id y date son requeridos" });
        return;
      }
      const data = await this.service.save({ appuser_id: BigInt(appuser_id), date: new Date(date) });
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }
}

export type { LunchSkipsController };
export default new LunchSkipsController();
