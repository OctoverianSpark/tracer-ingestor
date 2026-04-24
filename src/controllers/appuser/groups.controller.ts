import groupsService, { GroupService } from "../../services/appuser/groups.service.js";
import Controller from "../controller.js";


class GroupController extends Controller<GroupService> {
  protected service = groupsService
}


export type { GroupController }
export default new GroupController()