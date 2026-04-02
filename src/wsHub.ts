// wsHub.ts
import WebSocket from "ws";
import type { ClientConnection, WsMessage } from "./types/tracer.js";
import { saveClient } from "./services/tracer.service.js";
import prisma from "./lib/prisma.js";

class WsHub {
  private clients = new Map<string, ClientConnection>();

  async initialize() {
    const existingClients = await prisma.computers.findMany()
    for (const client of existingClients) {
      this.clients.set(client.hostname, {
        ws: null as unknown as WebSocket, // Placeholder, will be replaced on actual connection
        machineName: client.hostname,
        machineSerial: client.serial_number!,
        ip: client.ip_address!,
        isAlive: true,
        connectedAt: new Date(),
        personal_id: client.personal_id!
      })
      console.log(`🟢 ${client.hostname} loaded from database`)
    }
  }

  private async findClient(machineSerial: string) {
    return await prisma.computers.findUnique({
      where: { hostname: machineSerial }
    })
  }


  async addClient(client: ClientConnection) {
    const existing = await this.findClient(client.machineSerial)

    if (existing) {
      console.log(`🟢 ${client.machineName} re-connected`)
    } else {
      await saveClient(client)
      console.log(`🟢 ${client.machineName} connected`)
    }

    this.clients.set(client.machineSerial, client)
  }

  removeClient(machineSerial: string) {
    const client = this.clients.get(machineSerial)
    if (!client) return

    client.ws.close()
    this.clients.delete(machineSerial)
    console.log(`🔴 ${client.machineName} disconnected`)
  }

  shutdownClient(machineSerial: string) {
    const client = this.clients.get(machineSerial)
    if (!client) return

    client.isAlive = false

    console.log(`🔴 ${client.machineName} disconnected`)
  }

  sendTo(machineSerial: string, payload: WsMessage) {
    const client = this.clients.get(machineSerial)

    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Client ${machineSerial} offline`)
    }

    client.ws.send(JSON.stringify(payload))
  }

  broadcast(payload: WsMessage) {
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(payload))
      }
    }
  }

  getClient(machineSerial: string): ClientConnection | undefined {
    return this.clients.get(machineSerial)
  }

  isOnline(machineSerial: string): boolean {
    return this.clients.has(machineSerial)
  }

  listAll() {
    return [...this.clients.values()].map(async c => {

      const personal = await prisma.personal.findUnique({
        where: {
          id: c.personal_id
        }
      })


      return {
        machineSerial: c.machineSerial,
        machineName: c.machineName,
        displayName: `${personal?.first_name} ${personal?.middle_name} ${personal?.last_name}`,
        ip: c.ip,
        isAlive: c.isAlive,
        connectedAt: c.connectedAt
      }

    })
  }
}

export const wsHub = new WsHub()