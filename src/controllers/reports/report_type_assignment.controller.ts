import Controller from "../controller.js";
import reportTypeAssignmentService, { type ReportTypeAssignmentService } from "../../services/reports/report_type_assignment.service.js";

class ReportTypeAssignmentController extends Controller<ReportTypeAssignmentService> {
  protected service = reportTypeAssignmentService;
}

export type { ReportTypeAssignmentController };
export default new ReportTypeAssignmentController();
