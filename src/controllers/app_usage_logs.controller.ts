import type { Request, Response } from "express";
import Controller from "./controller.js";
import appUsageLogsService, { AppUsageLogsService } from "../services/app_usage_logs.service.js";

function parseDateRangeQuery(req: Request): { fromDate: Date; toDate: Date; where: any } | { error: string } {
  const { from, to, computer_id } = req.query;

  if (!from || !to) {
    return { error: "Los parámetros 'from' y 'to' son requeridos (formato ISO 8601)" };
  }

  const fromDate = new Date(String(from));
  const toDate = new Date(String(to));

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return { error: "Fechas inválidas. Usa formato ISO 8601: YYYY-MM-DDTHH:mm:ss" };
  }

  // Antes ignoraba `computer_id` por completo — siempre traía TODAS las máquinas para el rango
  // de fechas (varias decenas de MB en rangos de varios días con la flota completa), aunque el
  // llamador solo necesitara una. Con el filtro puesto, además aprovecha el índice compuesto
  // [computer_id, interval_start] ya definido en el schema en vez de escanear por interval_start
  // solo.
  const where: any = { interval_start: { gte: fromDate, lte: toDate } };
  if (computer_id !== undefined) {
    where.computer_id = BigInt(String(computer_id));
  }

  return { fromDate, toDate, where };
}

class AppUsageLogsController extends Controller<AppUsageLogsService> {
  protected service = appUsageLogsService;

  async findByDate(req: Request, res: Response) {
    const { limit, offset } = req.query;
    const parsed = parseDateRangeQuery(req);
    if ("error" in parsed) return res.status(400).json({ ok: false, error: parsed.error });

    try {
      const data = await this.service.getAll(
        limit !== undefined ? Number(limit) : undefined,
        offset !== undefined ? Number(offset) : undefined,
        parsed.where
      );
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("[app-usage-logs/by-date] error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  // Igual que findByDate pero sin el JSON `apps` de cada fila — para llamadores que solo
  // necesitan saber cuándo hubo actividad (ej. cerrar ventanas abiertas de state_logs en el
  // reporte de Cumplimiento y Productividad), no el desglose de apps en sí. El desglose completo
  // se pide aparte, acotado a un solo usuario, cuando hace falta (ver "Ver apps" en el dashboard).
  async findByDateSummary(req: Request, res: Response) {
    const parsed = parseDateRangeQuery(req);
    if ("error" in parsed) return res.status(400).json({ ok: false, error: parsed.error });

    try {
      const data = await this.service.getSummary(parsed.where);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("[app-usage-logs/by-date/summary] error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { AppUsageLogsController };

export default new AppUsageLogsController();
