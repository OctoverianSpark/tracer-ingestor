import type { Request, Response } from "express"
import type { BatchPayload } from "../types/tracer.js"

import path from "path";
import fs from "fs";
import { app_usage_logs, state_log_category, state_log_state, state_log_type, state_logs } from "@prisma/client";
import prisma from "../lib/prisma.js";

const stateMap: Record<number, state_log_state> = {
  0: "working",
  1: "break",
  2: "wc",
  3: "lunch",
  4: "idle",
  5: "offline"
}

const categoryMap: Record<number, state_log_category> = {
  0: "active",
  1: "neutral",
  2: "inactive"
}

const typeMap: Record<number, state_log_type> = {
  0: "auto",
  1: "manual"
}


export async function getStateLogs(req: Request, res: Response) {
  const { personal_id } = req.query

  const id = Number(personal_id)

  const computer = await prisma.computers.findFirst({
    where: {
      personal_id: id
    }
  })

  if (!computer) return res.status(404).json({
    error: 'Computador no encontrado'
  })
  console.log(computer.id);


  const data = await prisma.state_logs.findMany({
    where: {
      computer_id: computer.id
    }
  })


  console.log(data);
  return res.status(200).json({
    ok: true,
    data
  })




}
export async function syncStates(req: Request, res: Response) {
  try {
    const payload = req.body as {
      WorkerId: string
      WorkerUserName: string

      Category: number
      State: number
      Type: number
      Timestamp: string
    }[]
    const workerId = payload[0]?.WorkerId

    if (!workerId) return res.status(400).json({ error: "No WorkerId" })


    const computer = await prisma.computers.findFirst({
      where: { hostname: workerId }
    })

    if (!computer) {
      return res.status(404).json({ error: "Computer not found" })
    }


    await prisma.state_logs.createMany({
      data: payload.map(log => ({
        computer_id: computer.id,
        user_name: log.WorkerUserName,
        state: stateMap[log.State],
        category: categoryMap[log.Category],
        type: typeMap[log.Type],
        timestamp: new Date(log.Timestamp)
      } as state_logs))
    })

    res.json({ ok: true, count: payload.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to sync states" })
  }
}
export async function syncAppUsage(req: Request, res: Response) {
  try {
    const payload = req.body as {
      WorkerId: string
      WorkerUserName: string
      IntervalStart: string
      IntervalEnd: string
      Apps: string
    }[]

    const workerId = payload[0]?.WorkerId
    console.log(workerId);

    if (!workerId) return res.status(400).json({ error: "No WorkerId" })


    const computer = await prisma.computers.findFirst({
      where: { hostname: workerId }
    })

    if (!computer) {
      return res.status(404).json({ error: "Computer not found" })
    }


    // Usa createMany en lugar de forEach para eficiencia
    await prisma.app_usage_logs.createMany({
      data: payload.map(log => ({
        computer_id: computer.id,
        interval_start: new Date(log.IntervalStart),
        interval_end: new Date(log.IntervalEnd),
        apps: JSON.parse(log.Apps)
      }))
    })

    res.json({ ok: true, count: payload.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to sync app usage" })
  }
}

export async function pingData(req: Request, res: Response) {

  console.log("API CONNECTED WITH TRACER")



  res.json({
    msg: {
      text: "Hello"
    }
  })
}


export async function getBatchData(req: Request, res: Response) {

  console.log("GET BATCH DATA FUNCTION");




}




export async function saveScreenShot(req: Request, res: Response) {
  try {

    const file = req.file;
    const machine = req.body?.machine as string;

    if (!file) {
      console.log("[SCREENSHOT] ERROR: No file");
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!machine) {
      console.log("[SCREENSHOT] ERROR: Missing machine or user | machine:", machine);
      res.status(400).json({ error: "Missing machine or user fields" });
      return;
    }

    return res.status(200).json({
      ok: true,
      message: "Screenshot saved successfully",
    })

  } catch (ex) {
    console.error(`[SCREENSHOT ERROR] ${(ex as Error).message}`);
    res.status(500).json({ error: "Failed to save screenshot" });
  }
}