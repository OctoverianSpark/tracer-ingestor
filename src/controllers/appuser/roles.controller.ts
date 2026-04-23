import rolesService, { RoleService } from "../../services/appuser/roles.service";
import Controller from "../controller";

class RolesController extends Controller<RoleService> {

  protected service = rolesService
}


export type { RolesController }
export default new RolesController()