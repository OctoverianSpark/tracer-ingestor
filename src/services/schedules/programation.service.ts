import type { computers, Prisma, programation } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import type { ClientConnection } from "../../types/tracer.js";
import Service from "../service.js";


class ProgramationService extends Service<programation, Prisma.programationCreateInput, Prisma.programationUpdateInput, Prisma.programationWhereInput, Prisma.programationWhereUniqueInput> {
  protected model = prisma.programation
}


export type { ProgramationService }
export default new ProgramationService();