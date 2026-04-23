import programationService, { ProgramationService } from "../../services/schedules/programation.service";
import Controller from "../controller";

class ProgramationController extends Controller<ProgramationService> {

  protected service = programationService;

}


export default new ProgramationController();