import { computers, Prisma } from "@prisma/client";
import type { ClientConnection } from "../types/tracer.js";
import prisma from "../lib/prisma.js";
import Service from "./service.js";




class ComputerService extends Service<computers, Prisma.computersCreateInput, Prisma.computersUpdateInput, Prisma.computersWhereInput, Prisma.computersWhereUniqueInput> {

  protected model = prisma.computers


  async upsert(data: Prisma.computersCreateInput) {
    this.model.upsert({
      where: { hostname: data.hostname },
      create: data,
      update: data
    })
  }

}


export type { ComputerService }
export default new ComputerService()


