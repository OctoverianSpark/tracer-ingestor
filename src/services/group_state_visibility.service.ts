import { group_state_visibility, Prisma } from "@prisma/client";
import Service from "./service.js";
import prisma from "../lib/prisma.js";

class GroupStateVisibilityService extends Service<
  group_state_visibility,
  Prisma.group_state_visibilityUncheckedCreateInput,
  Prisma.group_state_visibilityUpdateInput,
  Prisma.group_state_visibilityWhereInput,
  Prisma.group_state_visibilityWhereUniqueInput
> {
  protected model = prisma.group_state_visibility;

  // Idempotente por (group_id, code): si ya está oculto, no falla ni duplica — devuelve la fila
  // existente tal cual (doble click, dos pestañas, etc. no deben mostrar un error de "ya oculto").
  async save(data: Prisma.group_state_visibilityUncheckedCreateInput) {
    return this.model.upsert({
      where: { group_id_code: { group_id: data.group_id, code: data.code } },
      create: data,
      update: {}
    });
  }
}

export type { GroupStateVisibilityService };
export default new GroupStateVisibilityService();
