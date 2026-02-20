import type { Request, Response } from "express"
import type { BatchPayload } from "../types/tracer.js"

import path from "path";
import fs from "fs";
export async function ingestBatch(req: Request, res: Response) {
  try {
    const payload = req.body as BatchPayload
    console.log(payload);
    
    res.json({ status: "ok" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "fail" })
  }
}

export async function pingData(req:Request, res:Response){

  console.log("API CONNECTED WITH TRACER")



  res.json({
    msg: {
      text: "Hello"
    }
  })
}


export async function getBatchData(req:Request, res:Response){

  console.log("GET BATCH DATA FUNCTION");

  
  

}



export async function saveScreenShot(req: Request, res: Response) {
  try {

    const file = req.file;
    const machine = req.body?.machine as string;
    const user = req.body?.user as string;

    if (!file) {
      console.log("[SCREENSHOT] ERROR: No file");
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!machine || !user) {
      console.log("[SCREENSHOT] ERROR: Missing machine or user | machine:", machine, "user:", user);
      res.status(400).json({ error: "Missing machine or user fields" });
      return;
    }
    
    return res.status(200).json({
      ok:true,
      message: "Screenshot saved successfully",
    })

  }catch(ex) {
    console.error(`[SCREENSHOT ERROR] ${(ex as Error).message}`);
    res.status(500).json({ error: "Failed to save screenshot" });
  }
}