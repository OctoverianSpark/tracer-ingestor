import { Request, Response } from "express";
import scheduleService, { ScheduleService } from "../../services/schedules/schedule.service.js";
import Controller from "../controller.js";

class ScheduleController extends Controller<ScheduleService> {
  protected service = scheduleService

  constructor() {
    super([], ['limit', 'offset', 'appuser_id', 'programation_id'])
  }

  // La base solo lee limit/offset de parseQuery y nunca pasa un `where` — appuser_id/programation_id
  // quedaban declarados como queryParams pero se ignoraban por completo, devolviendo SIEMPRE la
  // tabla entera. Un consumidor que pida "el horario de este usuario" recibe TODOS los horarios de
  // TODOS los usuarios y termina quedándose con la primera fila que matchee por otro criterio
  // (ej. día de la semana) — caso real: el agente de escritorio (ActiMetrics) tomaba el horario de
  // OTRA persona al azar para decidir su fin de jornada/apagado automático.
  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset, appuser_id, programation_id } = this.parseQuery(req);
      const where: Record<string, bigint> = {};
      if (appuser_id !== undefined) where.appuser_id = BigInt(appuser_id);
      if (programation_id !== undefined) where.programation_id = BigInt(programation_id);

      const data = await this.service.getAll(limit, offset, Object.keys(where).length ? where : undefined);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
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