import { Request, Response } from "express";
import scheduleService, { ScheduleService } from "../../services/schedules/schedule.service";
import Controller from "../controller";

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




}

export type { ScheduleController }
export default new ScheduleController()