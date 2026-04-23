import Service from "../services/service"
import { Request, Response } from "express";

export default abstract class Controller<TService extends Service<any, any, any, any, any>> {

  protected abstract service: TService;

  private static defaultParams = ['id'];
  private static defaultQuery = ['limit', 'offset'];

  protected params: string[];
  protected queryParams: string[];

  constructor(params: string[] = [], queryParams: string[] = []) {
    this.params = [...Controller.defaultParams, ...params];
    this.queryParams = [...Controller.defaultQuery, ...queryParams];

    // ✅ recorre toda la cadena de prototipos
    let proto = Object.getPrototypeOf(this);
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach(method => {
        if (method !== 'constructor' && typeof (this as any)[method] === 'function') {
          (this as any)[method] = (this as any)[method].bind(this);
        }
      });
      proto = Object.getPrototypeOf(proto);
    }
  }

  protected parseParams(req: Request): Record<string, number> {
    return this.params.reduce((acc, param) => {
      const value = Number(req.params[param]);
      if (isNaN(value)) throw new Error(`Invalid param: ${param}`);
      acc[param] = value;
      return acc;
    }, {} as Record<string, number>);
  }

  protected parseQuery(req: Request): Record<string, number | undefined> {
    console.log(req.query);

    return this.queryParams.reduce((acc, param) => {
      const raw = req.query[param];
      const value = raw !== undefined ? Number(raw) : undefined;
      if (value !== undefined && isNaN(value)) throw new Error(`Invalid query param: ${param}`);
      acc[param] = value;
      return acc;
    }, {} as Record<string, number | undefined>);
  }

  async getAll(req: Request, res: Response) {
    try {
      const { limit, offset } = req.query;
      console.log('Query params:', { limit, offset });

      const data = await this.service.getAll();
      res.status(200).json(data);
    } catch (error: any) {
      console.log(error);

      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = this.parseParams(req); // ✅ ya no toca req.params directo
      const data = await (this.service as any).getById(id);
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ ok: false, error: error.message });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const data = await (this.service as any).save(req.body);
      console.log(data);

      res.status(201).json(data);
    } catch (error: any) {
      console.log(error);

      res.status(400).json({ ok: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = this.parseParams(req);
      console.log(id);

      const data = await (this.service as any).update(id, req.body);
      console.log(data);

      res.json(data);
    } catch (error: any) {
      console.log(error);

      res.status(400).json({ ok: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = this.parseParams(req);
      await (this.service as any).delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ ok: false, error: error.message });
    }
  }
}