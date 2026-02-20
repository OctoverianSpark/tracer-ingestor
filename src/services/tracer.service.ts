import type { clients } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { ClientConnection } from "../types/tracer";

export const saveClient = async (client:ClientConnection) =>{


  const data :Omit<clients,'id'|'connectedAt'> = {
    
      machineSerial:client.machineSerial,
      machineName: client.machineName,
      userName: client.userName,
      displayName: client.displayName,
      ip: client.ip,
  }
  await prisma.clients.create({data})
}