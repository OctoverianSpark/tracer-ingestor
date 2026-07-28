import type { Request, Response } from "express";
import Controller from "./controller.js";
import productivitySettingsService, { type ProductivitySettingsService } from "../services/productivity_settings.service.js";

class ProductivitySettingsController extends Controller<ProductivitySettingsService> {
  protected service = productivitySettingsService;

  // Fila única (id=1) — no encaja en el update(id, data) genérico de la base, que espera un
  // :id en la ruta; acá siempre es la misma fila.
  async getSettings(req: Request, res: Response) {
    try {
      const data = await this.service.getSingleton();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const { uncategorized_credit, productive_credit, unproductive_credit } = req.body as {
        uncategorized_credit?: number;
        productive_credit?: number;
        unproductive_credit?: number;
      };
      if (uncategorized_credit == null || productive_credit == null || unproductive_credit == null) {
        res.status(400).json({ ok: false, error: "uncategorized_credit, productive_credit y unproductive_credit son requeridos" });
        return;
      }
      const data = await this.service.save({
        uncategorized_credit: Number(uncategorized_credit),
        productive_credit: Number(productive_credit),
        unproductive_credit: Number(unproductive_credit),
      });
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  }
}

export type { ProductivitySettingsController }
export default new ProductivitySettingsController()
