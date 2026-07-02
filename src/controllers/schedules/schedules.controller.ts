import { Request, Response } from "express";
import scheduleService, { ScheduleService } from "../../services/schedules/schedule.service.js";
import Controller from "../controller.js";

class ScheduleController extends Controller<ScheduleService> {
  protected service = scheduleService

  constructor() {
    super([], ['limit', 'offset', 'appuser_id', 'programation_id'])
  }


  async saveSchedules(req: Request, res: Response) {
    try {
      const { body } = req
      const schedule = await this.service.saveMany(body)

      res.json({ ok: true, data: schedule })
    } catch (error) {

      console.log(error);

      res.status(500).json({ message: "Error saving schedules", error })
    }
  }

  async getEffective(req: Request, res: Response) {
    try {
      const appuser_id = Number(req.query.appuser_id);
      const date = req.query.date as string;

      if (!req.query.appuser_id || isNaN(appuser_id)) throw new Error('Invalid or missing appuser_id');
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid or missing date');

      const programation = await this.service.getEffectiveSchedule(BigInt(appuser_id), date);

      if (!programation) return res.status(204).send();

      res.status(200).json(programation);
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ ok: false, error: error.message });
    }
  }


}

export type { ScheduleController }
export default new ScheduleController()