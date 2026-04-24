import rolesService, { RoleService } from "../../services/appuser/roles.service.js";
import Controller from "../controller.js";

class RolesController extends Controller<RoleService> {

  protected service = rolesService
}


export type { RolesController }
export default new RolesController()