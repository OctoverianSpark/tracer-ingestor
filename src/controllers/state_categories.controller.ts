import type { Request, Response } from "express";
import Controller from "./controller.js";
import stateCategoriesService, { type StateCategoriesService } from "../services/state_categories.service.js";

class StateCategoriesController extends Controller<StateCategoriesService> {
  protected service = stateCategoriesService;

  constructor() {
    super([], ["limit", "offset", "group_id"]);
  }

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset, group_id } = this.parseQuery(req);
      const where = { group_id: group_id !== undefined ? group_id : null };
      const data = await this.service.getAll(limit, offset, where);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { StateCategoriesController };
export default new StateCategoriesController();
