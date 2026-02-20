// wsHub.ts
import WebSocket from "ws";
import type { ClientConnection } from "./types/tracer.js";
import { saveClient } from "./services/tracer.service.js";
import prisma from "./lib/prisma.js";

interface FilePayload {
  type: 3
  fileName: string
  fileSize: number
  mimeType: string

  data: string // Base64
}

class WsHub {
  private clients = new Map<string, ClientConnection>();

  private getClients = async (serialNumber: string) => {

    const data = await prisma.clients.findFirst({
      where: {
        machineSerial:serialNumber
      }
    })
    return data

  } 

  async addClient(client: ClientConnection) {
    const findClient = await this.getClients(client.machineSerial)
    if(findClient){
      

      
      console.log(`🟢 ${client.machineName} re-connected`);

    }else{
      saveClient(client)
      console.log(`🟢 ${client.machineName} connected`);

    }
    this.clients.set(client.machineSerial, client);

  }

  removeClient(machineId: string) {
    const client = this.clients.get(machineId);
    if (!client) return;

    client.ws.close();
    this.clients.delete(machineId);
    console.log(`🔴 ${machineId} disconnected`);
  }

  sendTo(machineId: string, payload: unknown) {
    const client = this.clients.get(machineId);
    console.log(client);
    
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Client offline");
    }

    client.ws.send(JSON.stringify(payload));
  }

  shutdownClient(machineId: string) {
    const client = this.clients.get(machineId)
    if(client){
      client.isAlive = false
    }
    console.log('Client disconnected, waiting for conn');
    
  }

  
  sendFile(machineId: string, payload: FilePayload) {
  const client = this.clients.get(machineId)

  if(!client || client.ws.readyState !== WebSocket.OPEN) {
    throw new Error("Client offline")
  }

  // Enviar como JSON string
  client.ws.send(JSON.stringify(payload))
}




  broadcast(payload: unknown) {
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(payload));
      }
    }
  }

  isOnline(machineId: string): boolean {
    return this.clients.has(machineId);
  }

  listOnline() {
    return [...this.clients.values()].map(c => ({
      machineId: c.machineId,
      machineName: c.machineName,
      machineSerial: c.machineSerial,
      ip: c.ip,
      userName: c.userName,
      displayName: c.displayName,
      isAlive: c.isAlive
    }));
  }
}

export const wsHub = new WsHub();
