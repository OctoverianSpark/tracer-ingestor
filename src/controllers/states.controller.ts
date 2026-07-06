import Controller from "./controller.js";
import statesService, { type StatesService } from "../services/states.service.js";

class StatesController extends Controller<StatesService> {
  protected service = statesService;
}

export type { StatesController };
export default new StatesController();
