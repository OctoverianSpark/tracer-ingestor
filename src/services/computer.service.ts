import { computers, Prisma } from "@prisma/client";
import type { ClientConnection } from "../types/tracer.js";
import prisma from "../lib/prisma.js";
import Service from "./service.js";




class ComputerService extends Service<computers, Prisma.computersCreateInput, Prisma.computersUpdateInput, Prisma.computersWhereInput, Prisma.computersWhereUniqueInput> {

  protected model = prisma.computers


  async upsert(data: Prisma.computersCreateInput) {
    return await this.model.upsert({
      where: { hostname: data.hostname },
      create: data,
      update: data
    })
  }

  async deleteBySerial(serial: string) {
    return await this.model.delete({ where: { serial_number: serial } });
  }

  async setTakeScreenshots(serial: string, enabled: boolean) {
    return await this.model.update({
      where: { serial_number: serial },
      data: { take_screenshots: enabled }
    });
  }

}


export type { ComputerService }
export default new ComputerService()


