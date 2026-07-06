import type { Request, Response } from "express";
import reportTypeAssignmentService from "../../services/reports/report_type_assignment.service.js";

class ReportTypeAssignmentController {
  getAll = async (req: Request, res: Response) => {
    const { report_type_id, group_id } = req.query as Record<string, string | undefined>;
    try {
      const data = await reportTypeAssignmentService.getAll(
        report_type_id !== undefined ? Number(report_type_id) : undefined,
        group_id !== undefined ? Number(group_id) : undefined
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  };

  save = async (req: Request, res: Response) => {
    const { report_type_id, group_id } = req.body as { report_type_id: number; group_id: number };
    if (!report_type_id || !group_id) {
      return res.status(400).json({ ok: false, error: "report_type_id and group_id are required" });
    }
    try {
      const data = await reportTypeAssignmentService.assign(Number(report_type_id), Number(group_id));
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    const report_type_id = Number(req.params.report_type_id);
    const group_id = Number(req.params.group_id);
    if (isNaN(report_type_id) || isNaN(group_id)) {
      return res.status(400).json({ ok: false, error: "Invalid parameters" });
    }
    try {
      await reportTypeAssignmentService.unassign(report_type_id, group_id);
      res.status(204).send();
    } catch (error: any) {
      if (error?.code === "P2025") return res.status(404).json({ ok: false, error: "Assignment not found" });
      res.status(500).json({ ok: false, error: error.message });
    }
  };
}

export type { ReportTypeAssignmentController };
export default new ReportTypeAssignmentController();
