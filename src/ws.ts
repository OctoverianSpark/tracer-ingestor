// wsServer.ts
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { wsHub } from "./wsHub.js";
import type { ClientConnection } from "./types/tracer.js";
import prisma from "./lib/prisma.js";

const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });

export const startWs = () => {

  wsHub.initialize();
  console.log("WebSocket running on 8080");
  process.on("SIGTERM", () => wsHub.shutdown());
  process.on("SIGINT", () => wsHub.shutdown());
  wss.on("connection", async (ws, req) => {
    try {

      const url = new URL(req.url!, "http://localhost");
      const token = url.searchParams.get("token");
      console.log(token);

      if (!token) {
        ws.close();
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      )

      const payload = decoded as ClientConnection & { email: string }

      const appuser = await prisma.appuser.findFirst({
        where: { email: payload.email }
      })

      if (!appuser) {
        ws.close();
        return;
      }



      await wsHub.addClient({
        ws: ws,
        machineSerial: payload.machineSerial,
        userName: payload.userName,
        machineName: payload.machineName,
        machineBrand: payload.machineBrand,
        machineModel: payload.machineModel,
        ip: payload.ip,
        isAlive: true,
        connectedAt: new Date(),
        appuser_id: appuser.id
      }, ws);



      ws.on("pong", () => {
        const client = wsHub.getClient(payload.machineSerial);
        if (client) client.isAlive = true;
      });

      ws.on("close", () => {
        wsHub.shutdownClient(payload.machineSerial, ws);
      });

      ws.on("message", data => {
        console.log(`📩 ${payload.machineName}:`, data.toString());
      });

    } catch (err) {
      console.log(err);

      ws.close();
    }
  });

}