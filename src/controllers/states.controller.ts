import type { Request, Response } from "express";
import Controller from "./controller.js";
import statesService, { type StatesService } from "../services/states.service.js";

class StatesController extends Controller<StatesService> {
  protected service = statesService;

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

export type { StatesController };
export default new StatesController();
