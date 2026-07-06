import { Router } from "express";
import reportTypeAssignmentController from "../controllers/reports/report_type_assignment.controller.js";

const reportTypeAssignmentsRoutes = Router();

reportTypeAssignmentsRoutes.get("/", reportTypeAssignmentController.getAll);
reportTypeAssignmentsRoutes.post("/save", reportTypeAssignmentController.save);
reportTypeAssignmentsRoutes.delete("/delete/:id", reportTypeAssignmentController.delete);

export default reportTypeAssignmentsRoutes;
