import Controller from "../controller.js";
import reportTypeService, { type ReportTypeService } from "../../services/reports/report_type.service.js";

class ReportTypeController extends Controller<ReportTypeService> {
  protected service = reportTypeService;
}

export type { ReportTypeController };
export default new ReportTypeController();
