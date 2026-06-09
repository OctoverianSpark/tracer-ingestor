import type { Request, Response } from "express";

import prisma from "../../lib/prisma.js";
import Controller from "../controller.js";
import appuserService, { AppUserService } from "../../services/appuser/appuser.service.js";


class PersonalController extends Controller<AppUserService> {
  protected service = appuserService;

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset } = this.parseQuery(req);
      const hasScheduleRaw = req.query['has_schedule'];
      const hasSchedule =
        hasScheduleRaw === 'true' ? true :
        hasScheduleRaw === 'false' ? false :
        undefined;

      const data = await this.service.getAllWithScheduleFilter(limit, offset, undefined, hasSchedule);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async findByEmail(req: Request, res: Response) {

    const { email } = req.query
    console.log(email);


    try {

      const data = await this.service.getAll(undefined, undefined, {

        email: String(email)
      })

      return res.status(200).json(data.shift())
    } catch (error) {
      console.log(error);

      return res.status(404).json({ error })
    }

  }

  async deleteMany(req: Request, res: Response) {

    const { ids } = req.body
    console.log(ids);

    try {

      const data = await this.service.deleteMany(ids)

      return res.status(200).json(data)
    } catch (error) {
      console.log(error);

      return res.status(404).json({ error })
    }
  }



}

export type { PersonalController };      // 👈 exportas el tipo nombrado
export default new PersonalController();



