import { Router } from "express";
import reportTypeAssignmentController from "../controllers/reports/report_type_assignment.controller.js";

const reportTypeAssignmentsRoutes = Router();

reportTypeAssignmentsRoutes.get("/", reportTypeAssignmentController.getAll);
reportTypeAssignmentsRoutes.post("/save", reportTypeAssignmentController.save);
reportTypeAssignmentsRoutes.delete("/delete/:report_type_id/:group_id", reportTypeAssignmentController.delete);

export default reportTypeAssignmentsRoutes;
