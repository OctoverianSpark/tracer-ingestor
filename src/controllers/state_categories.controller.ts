import Controller from "./controller.js";
import stateCategoriesService, { type StateCategoriesService } from "../services/state_categories.service.js";

class StateCategoriesController extends Controller<StateCategoriesService> {
  protected service = stateCategoriesService;
}

export type { StateCategoriesController };
export default new StateCategoriesController();
