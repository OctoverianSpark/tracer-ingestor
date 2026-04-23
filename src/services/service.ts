import { personalWhereInput, personalWhereUniqueInput } from "../generated/prisma/models";
import prisma from "../lib/prisma";



export default abstract class Service<T, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> {

  protected abstract model: any; // delegate al modelo de prisma



  async save(data: CreateInput): Promise<T> {
    console.log(data);

    return this.model.create({ data });
  }

  async getAll(limit?: number, offset?: number, where?: WhereInput): Promise<T[]> {


    return this.model.findMany({
      ...(where !== undefined && { where }),
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
    });
  }

  async getByUnique(where: WhereUniqueInput) {

    return this.model.findUnique({
      where
    })
  }

  async getById(id: number): Promise<T> {
    const found = await this.model.findUnique({ where: { id } });
    if (!found) throw new Error('Record not found');
    return found;
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    await this.getById(id);
    return this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<T> {
    await this.getById(id);
    return this.model.delete({ where: { id } });
  }
}