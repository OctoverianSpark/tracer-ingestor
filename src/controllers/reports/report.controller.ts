import type { Request, Response } from "express";
import Controller from "../controller.js";
import reportService, { type ReportService } from "../../services/reports/report.service.js";

class ReportController extends Controller<ReportService> {
  protected service = reportService;

  constructor() {
    super([], ["limit", "offset", "computer_id", "report_type_id", "appuser_id"]);
  }

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset, computer_id, report_type_id, appuser_id } = this.parseQuery(req);
      const where = {
        ...(computer_id !== undefined && { computer_id: BigInt(computer_id) }),
        ...(report_type_id !== undefined && { report_type_id }),
        ...(appuser_id !== undefined && { appuser_id: BigInt(appuser_id) })
      };
      const data = await this.service.getAll(limit, offset, where);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async createReport(req: Request, res: Response) {
    const { serial, report_type_id, message } = req.body as { serial: string; report_type_id: number; message: string };
    if (!serial || !report_type_id || !message) {
      return res.status(400).json({ ok: false, error: "serial, report_type_id and message are required" });
    }
    try {
      const data = await this.service.createFromAgent(serial, Number(report_type_id), message);
      res.status(201).json({ ok: true, data });
    } catch (error: any) {
      console.error("[REPORT] Error", error);
      if (error?.message === "Computer not found") return res.status(404).json({ ok: false, error: "Computer not found" });
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { ReportController };
export default new ReportController();
