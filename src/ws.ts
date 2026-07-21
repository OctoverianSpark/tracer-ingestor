// wsServer.ts
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { wsHub } from "./wsHub.js";
import type { ClientConnection, WsMessage } from "./types/tracer.js";
import { MessageTypes } from "./types/tracer.js";
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // --- Dashboard client ---
      if (decoded.role === "dashboard") {
        const email = decoded.email as string | undefined;
        if (!email) { ws.close(); return; }

        const appuser = await prisma.appuser.findFirst({ where: { email } });
        if (!appuser) { ws.close(); return; }

        wsHub.addDashboard(email, ws);

        ws.on("pong", () => {
          const client = wsHub.getDashboard(email);
          if (client) client.isAlive = true;
        });

        ws.on("close", () => wsHub.removeDashboard(email, ws));
        return;
      }

      // --- Desktop agent client ---
      const payload = decoded as ClientConnection & { email: string }

      const appuser = await prisma.appuser.findFirst({
        where: { email: payload.email }
      })

      if (!appuser) {
        ws.close();
        return;
      }

      const normalizeIp = (ip: string | undefined) =>
        ip?.replace(/^::ffff:/i, '').trim() || undefined;

      const forwardedIps = (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
      const forwardedIp = normalizeIp(forwardedIps[0]);

      const socketIp = normalizeIp(req.socket.remoteAddress);

      // localIp es la IP LAN que el agente reportaba de sí mismo (192.168.x.x) — nunca la IP
      // pública real, así que va al final como respaldo. forwardedIp/socketIp vienen de la
      // conexión misma (X-Forwarded-For si hay proxy delante, o la IP del socket TCP directo),
      // que sí son la IP pública real vista desde afuera.
      const localIp = normalizeIp(payload.localIp as string | undefined);

      const detectedIp = forwardedIp ?? socketIp ?? localIp ?? payload.ip;

      await wsHub.addClient({
        ws: ws,
        machineSerial: payload.machineSerial,
        userName: payload.userName,
        machineName: payload.machineName,
        machineBrand: payload.machineBrand,
        machineModel: payload.machineModel,
        ip: detectedIp,
        isAlive: true,
        isRdp: (payload as any).isRdp === "true",
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
        let msg: WsMessage;
        try {
          msg = JSON.parse(data.toString());
        } catch {
          return;
        }
        if (msg.type === MessageTypes.SyncData) {
          wsHub.handleSyncData(payload.machineSerial, ws, msg)
            .catch(err => console.error(`[sync] Error processing sync from ${payload.machineName}:`, err));
        }
      });

    } catch (err) {
      console.log(err);

      ws.close();
    }
  });

}