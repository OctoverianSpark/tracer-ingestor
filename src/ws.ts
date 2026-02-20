// wsServer.ts
import  { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { wsHub } from "./wsHub.js";
import type { ClientConnection } from "./types/tracer.js";

const wss = new WebSocketServer({ port: 8080 });

export const startWs = () => {
  console.log("WebSocket running on 8080")
wss.on("connection", (ws, req) => {
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

    const payload = decoded as ClientConnection


    console.log(decoded);

    wsHub.addClient({
      ws,
      machineId: payload.machineId,
      machineSerial:payload.machineSerial,
      machineName: payload.machineName,
      userName: payload.userName,
      displayName: payload.displayName,
      ip: payload.ip,
      isAlive:true,
      connectedAt: new Date()
    });



    ws.on("close", () => {
      wsHub.shutdownClient(payload.machineSerial)
    });

    ws.on("message", data => {
      console.log(`📩 ${payload.machineId}:`, data.toString());
    });

  } catch (err) {
    console.log(err);

    ws.close();
  }
});

}