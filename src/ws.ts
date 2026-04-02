// wsServer.ts
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { wsHub } from "./wsHub.js";
import type { ClientConnection } from "./types/tracer.js";
import prisma from "./lib/prisma.js";

const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

export const startWs = () => {

  wsHub.initialize()
  console.log("WebSocket running on 8080")
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

      const employee = await prisma.personal.findFirst({
        where: { corporative_email: payload.email }
      })

      if (!employee) {
        ws.close();
        return;
      }



      wsHub.addClient({
        ws,
        machineSerial: payload.machineSerial,
        machineName: payload.machineName,
        ip: payload.ip,
        isAlive: true,
        connectedAt: new Date(),
        personal_id: employee.id
      });



      ws.on("close", () => {
        wsHub.shutdownClient(payload.machineSerial)
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