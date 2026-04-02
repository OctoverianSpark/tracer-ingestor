import type { computers } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { ClientConnection } from "../types/tracer";

export const saveClient = async (client: ClientConnection) => {


  const data: Omit<computers, 'id' | 'last_seen' | 'created_at' | 'updated_at'> = {

    serial_number: client.machineSerial,
    hostname: client.machineName,
    ip_address: client.ip,
    personal_id: client.personal_id


  }

  console.log(data);
  await prisma.computers.upsert({
    where: { hostname: data.hostname },   // busca por hostname
    update: {                              // si existe, actualiza
      serial_number: data.serial_number,
      ip_address: data.ip_address,
      personal_id: data.personal_id
    },
    create: {                              // si no existe, crea
      serial_number: data.serial_number,
      hostname: data.hostname,
      ip_address: data.ip_address,
      personal_id: data.personal_id
    }
  })



}


