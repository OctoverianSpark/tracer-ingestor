import type { rotation_cycles, rotation_slots, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import Service from "../service.js";

type RotationCycleWithSlots = rotation_cycles & { slots: rotation_slots[] };

type SaveRotationCycleInput = {
  appuser_id: number | bigint;
  name: string;
  start_date: string;
  weeks: number;
  slots: { week_index: number; day_of_week: string; programation_id: number | bigint; skip_lunch?: boolean }[];
};

class RotationCycleService extends Service<rotation_cycles, Prisma.rotation_cyclesCreateInput, Prisma.rotation_cyclesUpdateInput, Prisma.rotation_cyclesWhereInput, Prisma.rotation_cyclesWhereUniqueInput> {
  protected model = prisma.rotation_cycles

  async getSlots(rotation_cycle_id: number): Promise<rotation_slots[]> {
    return prisma.rotation_slots.findMany({ where: { rotation_cycle_id } });
  }

  async saveWithSlots(data: SaveRotationCycleInput): Promise<RotationCycleWithSlots> {
    const appuser_id = BigInt(data.appuser_id);

    return prisma.$transaction(async (tx) => {
      await tx.rotation_cycles.deleteMany({ where: { appuser_id } });

      return tx.rotation_cycles.create({
        data: {
          appuser_id,
          name: data.name,
          start_date: new Date(data.start_date),
          weeks: data.weeks,
          slots: {
            create: data.slots.map(slot => ({
              week_index: slot.week_index,
              day_of_week: slot.day_of_week,
              programation_id: BigInt(slot.programation_id),
              skip_lunch: slot.skip_lunch ?? false,
            })),
          },
        },
        include: { slots: true },
      });
    });
  }
}

export type { RotationCycleService }
export default new RotationCycleService()
