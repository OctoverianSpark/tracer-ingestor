import { Request, Response } from "express";
import rotationCycleService, { RotationCycleService } from "../../services/schedules/rotation_cycle.service.js";
import Controller from "../controller.js";

class RotationCycleController extends Controller<RotationCycleService> {
  protected service = rotationCycleService

  constructor() {
    super([], ['limit', 'offset', 'appuser_id'])
  }

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset, appuser_id } = this.parseQuery(req);
      const where = appuser_id !== undefined ? { appuser_id: BigInt(appuser_id) } : undefined;
      const data = await this.service.getAll(limit, offset, where);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async getSlots(req: Request, res: Response) {
    try {
      const { id } = this.parseParams(req);
      const data = await this.service.getSlots(id!);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async saveCycle(req: Request, res: Response) {
    try {
      const cycle = await this.service.saveWithSlots(req.body);
      res.status(201).json({ ok: true, data: cycle });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ ok: false, error: error.message });
    }
  }
}

export type { RotationCycleController }
export default new RotationCycleController()
