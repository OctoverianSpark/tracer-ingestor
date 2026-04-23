import groupsService, { GroupService } from "../../services/appuser/groups.service";
import Controller from "../controller";


class GroupController extends Controller<GroupService> {
  protected service = groupsService
}


export type { GroupController }
export default new GroupController()