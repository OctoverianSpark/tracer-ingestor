import { Request, Response } from "express";
import groupsService, { GroupService } from "../../services/appuser/groups.service.js";
import Controller from "../controller.js";


class GroupController extends Controller<GroupService> {
  protected service = groupsService

  async getVisibleGroups(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid group id" });
      const data = await this.service.getVisibleGroups(id);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async addVisibility(req: Request, res: Response) {
    try {
      const viewerId = Number(req.params.id);
      const { visible_group_id } = req.body;
      if (isNaN(viewerId) || !visible_group_id) {
        return res.status(400).json({ ok: false, error: "Invalid parameters" });
      }
      const data = await this.service.addVisibility(viewerId, Number(visible_group_id));
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  async removeVisibility(req: Request, res: Response) {
    try {
      const viewerId = Number(req.params.id);
      const visibleId = Number(req.params.visible_id);
      if (isNaN(viewerId) || isNaN(visibleId)) {
        return res.status(400).json({ ok: false, error: "Invalid parameters" });
      }
      await this.service.removeVisibility(viewerId, visibleId);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ ok: false, error: error.message });
    }
  }
}


export type { GroupController }
export default new GroupController()