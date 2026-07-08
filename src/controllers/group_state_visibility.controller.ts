import type { Request, Response } from "express";
import Controller from "./controller.js";
import groupStateVisibilityService, { type GroupStateVisibilityService } from "../services/group_state_visibility.service.js";

class GroupStateVisibilityController extends Controller<GroupStateVisibilityService> {
  protected service = groupStateVisibilityService;

  constructor() {
    super([], ["limit", "offset", "group_id"]);
  }

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset, group_id } = this.parseQuery(req);
      const where = group_id !== undefined ? { group_id } : undefined;
      const data = await this.service.getAll(limit, offset, where);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { GroupStateVisibilityController };
export default new GroupStateVisibilityController();
