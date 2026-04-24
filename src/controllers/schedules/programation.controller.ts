import programationService, { ProgramationService } from "../../services/schedules/programation.service.js";
import Controller from "../controller.js";

class ProgramationController extends Controller<ProgramationService> {

  protected service = programationService;

}


export default new ProgramationController();