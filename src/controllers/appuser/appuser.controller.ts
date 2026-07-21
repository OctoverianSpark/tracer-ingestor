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

  // Payload mínimo: es lo que consulta el middleware del dashboard en cada request para saber
  // si la sesión activa fue revocada después del login.
  async getForceLogoutStatus(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);
      const user = await prisma.appuser.findUnique({ where: { id }, select: { force_logout_at: true } });
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
      res.status(200).json({ force_logout_at: user.force_logout_at });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  async revokeSession(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id as string);
      const data = await this.service.revokeSession(id);
      res.status(200).json({ ok: true, force_logout_at: data.force_logout_at });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }

  async revokeAllSessions(_req: Request, res: Response) {
    try {
      const data = await this.service.revokeAllSessions();
      res.status(200).json({ ok: true, count: data.count });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

}

export type { PersonalController };      // 👈 exportas el tipo nombrado
export default new PersonalController();



