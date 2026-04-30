import type { Request, Response } from "express";
import { category } from "@prisma/client";
import Controller from "./controller.js";
import categorizationAppsService, { CategorizationAppsService } from "../services/categorization_apps.service.js";

class CategorizationAppsController extends Controller<CategorizationAppsService> {
  protected service = categorizationAppsService;

  async findByCategory(req: Request, res: Response) {
    const { category: cat } = req.query;

    if (!cat || !Object.values(category).includes(cat as category)) {
      return res.status(400).json({ ok: false, error: `category must be one of: ${Object.values(category).join(", ")}` });
    }

    try {
      const data = await this.service.findByCategory(cat as category);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  }
}

export type { CategorizationAppsController };

export default new CategorizationAppsController();
