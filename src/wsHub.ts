// wsHub.ts
import WebSocket from "ws";
import type { ClientConnection, WsMessage } from "./types/tracer.js";
import prisma from "./lib/prisma.js";

class WsHub {
  private clients = new Map<string, ClientConnection>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  async initialize() {
    const existingClients = await prisma.computers.findMany({
      where: { serial_number: { not: null } }
    });
    for (const client of existingClients) {
      this.clients.set(client.serial_number!, {
        ws: null as unknown as WebSocket,
        userName: client.username ?? "Unknown",
        machineName: client.hostname,
        machineSerial: client.serial_number!,
        machineBrand: client.machineBrand ?? "",
        machineModel: client.machineModel ?? "",
        ip: client.ip_address ?? "",
        isAlive: false,
        connectedAt: new Date(),
        appuser_id: client.appuser_id!
      });
      console.log(`🟢 ${client.hostname} loaded from database`);
    }

    this.heartbeatInterval = setInterval(() => {
      for (const [serial, client] of this.clients.entries()) {
        if (!client.ws || client.ws.readyState !== WebSocket.OPEN) continue;
        if (!client.isAlive) {
          this.shutdownClient(serial);
          continue;
        }
        client.isAlive = false;
        client.ws.ping();
      }
    }, 30_000);
  }

  private findClient(machineSerial: string) {
    return this.clients.get(machineSerial);
  }

  async addClient(client: ClientConnection, ws: WebSocket) {
    const existing = this.findClient(client.machineSerial);

    await prisma.computers.upsert({
      where: { hostname: client.machineName },
      create: {
        hostname: client.machineName,
        serial_number: client.machineSerial,
        username: client.userName,
        ip_address: client.ip,
        machineBrand: client.machineBrand,
        machineModel: client.machineModel,
        appuser_id: client.appuser_id,
        last_seen: new Date()
      },
      update: {
        ip_address: client.ip,
        username: client.userName,
        machineBrand: client.machineBrand,
        machineModel: client.machineModel,
        last_seen: new Date()
      }
    });

    console.log(`🟢 ${client.machineName} ${existing ? "re-connected" : "connected"}`);
    this.clients.set(client.machineSerial, { ...client, ws, isAlive: true, connectedAt: new Date() });
  }

  shutdown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    for (const client of this.clients.values()) {
      if (client.ws) client.ws.close(1001, "Server shutting down");
    }
    this.clients.clear();
  }

  removeClient(machineSerial: string) {
    const client = this.clients.get(machineSerial);
    if (!client) return;

    if (client.ws) client.ws.close();
    this.clients.delete(machineSerial);
    console.log(`🔴 ${client.machineName} disconnected`);
  }

  shutdownClient(machineSerial: string) {
    const client = this.clients.get(machineSerial);
    if (!client) return;

    client.ws = null as unknown as WebSocket;
    client.isAlive = false;
    console.log(`🔴 ${client.machineName} disconnected`);

    prisma.computers.updateMany({
      where: { serial_number: machineSerial },
      data: { last_seen: new Date() }
    }).catch(err => console.error("[shutdownClient] last_seen update failed:", err));
  }

  sendTo(serialNumber: string, payload: WsMessage) {
    const client = this.clients.get(serialNumber);

    if (!client || !client.ws || client.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Client ${serialNumber} offline`);
    }
    client.ws.send(JSON.stringify(payload));
  }

  broadcast(payload: WsMessage) {
    for (const client of this.clients.values()) {
      if (client.ws?.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(payload));
      }
    }
  }

  getClient(machineSerial: string): ClientConnection | undefined {
    return this.clients.get(machineSerial);
  }

  isOnline(machineSerial: string): boolean {
    const client = this.clients.get(machineSerial);
    return !!client?.ws && client.ws.readyState === WebSocket.OPEN;
  }

  async listAll() {
    const clientList = [...this.clients.values()];

    const appuserIds = [
      ...new Set(
        clientList
          .map(c => c.appuser_id)
          .filter((id): id is bigint => id != null)
      )
    ];

    const appusers = await prisma.appuser.findMany({
      where: { id: { in: appuserIds } },
      select: { id: true, full_name: true }
    });

    const appuserMap = new Map(appusers.map(u => [String(u.id), u]));

    return clientList.map(c => ({
      serial_number: c.machineSerial,
      hostname: c.machineName,
      displayName: appuserMap.get(String(c.appuser_id))?.full_name ?? "Unknown",
      ip_address: c.ip,
      username: c.userName,
      machineBrand: c.machineBrand,
      machineModel: c.machineModel,
      isAlive: this.isOnline(c.machineSerial),
      last_seen: c.connectedAt
    }));
  }
}

export const wsHub = new WsHub();
