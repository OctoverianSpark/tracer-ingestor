import WebSocket from "ws"
export interface BatchPayload {
  agent_uuid: string
  user: string
  summary: TimeSummary
  logs: ActivityLog[]
}
export interface TimeSummary {
  date: string
  active_time: number
  idle_time: number
  productive_time: number
  unproductive_time: number
  overtime_time: number
}
export interface StateChangeEvent {
  timestamp: string // ISO UTC
  state: "productive" | "unproductive" | "neutral" | "overtime"
}
export interface BatchPayload {
  agent_uuid: string
  user: string
  summary: TimeSummary
  logs: ActivityLog[]
  state_events: StateChangeEvent[]
}
export 
interface ClientConnection { 
  ws: WebSocket;
  machineId: string;
  machineName: string;
  machineSerial: string;
  userName: string;
  isAlive: boolean;
  displayName: string;
  ip: string;
  connectedAt: Date;
}
