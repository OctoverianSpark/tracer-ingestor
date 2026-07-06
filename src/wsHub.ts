// wsHub.ts
import WebSocket from "ws";
import type { ClientConnection, DashboardConnection, DashboardEvent, SyncDataMessage, UserInfoMessage, WsMessage } from "./types/tracer.js";
import { MessageTypes } from "./types/tracer.js";
import prisma from "./lib/prisma.js";

class WsHub {
  private clients = new Map<string, ClientConnection>();
  private dashboardClients = new Map<string, DashboardConnection>();
  private connectionQueues = new Map<string, Promise<void>>();
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
        isRdp: false,
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

      for (const [id, dashboard] of this.dashboardClients.entries()) {
        if (!dashboard.ws || dashboard.ws.readyState !== WebSocket.OPEN) continue;
        if (!dashboard.isAlive) {
          this.removeDashboard(id);
          continue;
        }
        dashboard.isAlive = false;
        dashboard.ws.ping();
      }
    }, 30_000);
  }

  private findClient(machineSerial: string) {
    return this.clients.get(machineSerial);
  }

  addClient(client: ClientConnection, ws: WebSocket): Promise<void> {
    const pending = this.connectionQueues.get(client.machineSerial) ?? Promise.resolve();
    const task = pending.catch(() => { }).then(() => this._processConnection(client, ws));
    this.connectionQueues.set(client.machineSerial, task.catch(() => { }));
    return task;
  }

  private async _processConnection(client: ClientConnection, ws: WebSocket) {
    const existing = this.findClient(client.machineSerial);

    try {
      await prisma.computers.upsert({
        where: { serial_number: client.machineSerial },
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
          hostname: client.machineName,
          ip_address: client.ip,
          username: client.userName,
          machineBrand: client.machineBrand,
          machineModel: client.machineModel,
          appuser_id: client.appuser_id,
          last_seen: new Date()
        }
      });
    } catch (err: any) {
      // Handle unique constraint violations on hostname: another record exists with same hostname
      if (err?.code === "P2002" && err?.meta?.target && String(err.meta.target).includes("hostname")) {
        try {
          const existingByHost = await prisma.computers.findUnique({ where: { hostname: client.machineName } as any });
          if (existingByHost) {
            await prisma.computers.update({
              where: { id: existingByHost.id } as any,
              data: {
                serial_number: client.machineSerial,
                ip_address: client.ip,
                username: client.userName,
                machineBrand: client.machineBrand,
                machineModel: client.machineModel,
                appuser_id: client.appuser_id,
                last_seen: new Date()
              }
            });
          } else {
            // rethrow if we cannot resolve
            throw err;
          }
        } catch (innerErr) {
          console.error("[wsHub] Failed to resolve hostname unique conflict:", innerErr);
          throw innerErr;
        }
      } else {
        throw err;
      }
    }

    // Si el mismo serial ya tiene una conexión activa más reciente, cerrar la anterior
    const current = this.clients.get(client.machineSerial);
    if (current?.ws && current.ws !== ws && current.ws.readyState === WebSocket.OPEN) {
      current.ws.close(1000, "Replaced by newer connection");
    }

    console.log(`🟢 ${client.machineName} ${existing?.ws ? "re-connected" : "connected"}`);
    this.clients.set(client.machineSerial, { ...client, ws, isAlive: true, connectedAt: new Date() });

    this.broadcastToDashboards({
      event: 'machine_online',
      data: {
        serial:     client.machineSerial,
        hostname:   client.machineName,
        ip:         client.ip,
        username:   client.userName,
        appuser_id: String(client.appuser_id)
      }
    });
  }

  /** Procesa el SyncDataMessage que el agente envía en respuesta a ActionMessageTypes.Sync. */
  async handleSyncData(machineSerial: string, ws: WebSocket, data: SyncDataMessage) {
    const client = this.clients.get(machineSerial);
    if (!client) return;

    const hostname = data.hostname ?? client.machineName;
    const ip = data.ip ?? client.ip;
    const userName = data.username ?? client.userName;
    const machineBrand = data.machineBrand ?? client.machineBrand;
    const machineModel = data.machineModel ?? client.machineModel;

    this.clients.set(machineSerial, { ...client, machineName: hostname, ip, userName, machineBrand, machineModel });

    const computer = await prisma.computers.update({
      where: { serial_number: machineSerial },
      data: {
        hostname,
        ip_address: ip,
        username: userName,
        machineBrand,
        machineModel,
        last_seen: new Date()
      },
      include: { appuser: { include: { role: true, group: true } } }
    });

    const appuser = computer.appuser;
    const response: UserInfoMessage = {
      type: MessageTypes.UserInfo,
      appuser_id: appuser ? String(appuser.id) : null,
      full_name: appuser?.full_name ?? null,
      email: appuser?.email ?? null,
      role: appuser?.role?.name ?? null,
      group: appuser?.group?.name ?? null,
      absence_status: appuser?.absence_status ?? null
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  shutdown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    for (const client of this.clients.values()) {
      if (client.ws) client.ws.close(1001, "Server shutting down");
    }
    this.clients.clear();
    for (const client of this.dashboardClients.values()) {
      if (client.ws) client.ws.close(1001, "Server shutting down");
    }
    this.dashboardClients.clear();
  }

  removeClient(machineSerial: string) {
    const client = this.clients.get(machineSerial);
    if (!client) return;

    if (client.ws) client.ws.close();
    this.clients.delete(machineSerial);
    console.log(`🔴 ${client.machineName} disconnected`);
  }

  shutdownClient(machineSerial: string, ws?: WebSocket) {
    const client = this.clients.get(machineSerial);
    if (!client) return;
    if (ws && client.ws !== ws) return;

    client.ws = null as unknown as WebSocket;
    client.isAlive = false;
    console.log(`🔴 ${client.machineName} disconnected`);

    this.broadcastToDashboards({
      event: 'machine_offline',
      data: { serial: machineSerial, hostname: client.machineName }
    });

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

  addDashboard(id: string, ws: WebSocket): void {
    const existing = this.dashboardClients.get(id);
    if (existing?.ws?.readyState === WebSocket.OPEN) {
      existing.ws.close(1000, "Replaced by newer connection");
    }
    this.dashboardClients.set(id, { ws, id, isAlive: true, connectedAt: new Date() });
    console.log(`📊 Dashboard connected: ${id}`);
  }

  removeDashboard(id: string, ws?: WebSocket): void {
    const client = this.dashboardClients.get(id);
    if (!client) return;
    if (ws && client.ws !== ws) return;
    if (client.ws?.readyState === WebSocket.OPEN) client.ws.close();
    this.dashboardClients.delete(id);
    console.log(`📊 Dashboard disconnected: ${id}`);
  }

  getDashboard(id: string): DashboardConnection | undefined {
    return this.dashboardClients.get(id);
  }

  broadcastToDashboards(event: DashboardEvent): void {
    const msg = JSON.stringify(event);
    for (const client of this.dashboardClients.values()) {
      if (client.ws?.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
      }
    }
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
