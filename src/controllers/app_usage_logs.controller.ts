import type { Request, Response } from "express";
import Controller from "./controller.js";
import appUsageLogsService, { AppUsageLogsService } from "../services/app_usage_logs.service.js";

class AppUsageLogsController extends Controller<AppUsageLogsService> {
  protected service = appUsageLogsService;

  async findByDate(req: Request, res: Response) {
    const { from, to, limit, offset, computer_id } = req.query;

    if (!from || !to) {
      return res.status(400).json({ ok: false, error: "Los parámetros 'from' y 'to' son requeridos (formato ISO 8601)" });
    }

    const fromDate = new Date(String(from));
    const toDate = new Date(String(to));

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ ok: false, error: "Fechas inválidas. Usa formato ISO 8601: YYYY-MM-DDTHH:mm:ss" });
    }

    // Antes ignoraba `computer_id` por completo — siempre traía TODAS las máquinas para el rango
    // de fechas (varias decenas de MB en rangos de varios días con la flota completa), aunque el
    // llamador solo necesitara una. Con el filtro puesto, además aprovecha el índice compuesto
    // [computer_id, interval_start] ya definido en el schema en vez de escanear por interval_start
    // solo.
    const where: any = { interval_start: { gte: fromDate, lte: toDate } };
    if (computer_id !== undefined) {
      const cid = BigInt(String(computer_id));
      where.computer_id = cid;
    }

    try {
      const data = await this.service.getAll(
        limit !== undefined ? Number(limit) : undefined,
        offset !== undefined ? Number(offset) : undefined,
        where
      );
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { AppUsageLogsController };

export default new AppUsageLogsController();
