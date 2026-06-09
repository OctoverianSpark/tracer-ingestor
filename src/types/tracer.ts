import WebSocket from "ws"
export interface BatchPayload {
  agent_uuid: string
  user: string
  summary: TimeSummary
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
  state: "productive" | "unproductive" | "neutral"
}
export interface BatchPayload {
  agent_uuid: string
  user: string
  summary: TimeSummary
  state_events: StateChangeEvent[]
}
export
  interface ClientConnection {
  ws: WebSocket;
  machineName: string;
  machineSerial: string;
  userName: string;
  machineBrand: string;
  machineModel: string;
  isAlive: boolean;
  ip: string;
  localIp?: string;
  connectedAt: Date;
  appuser_id: bigint;
}


export enum MessageTypes {

  Action,
  File,
  Notification
}

export enum ActionMessageTypes {
  Lock,
  Restart,
  Shutdown,
  Logoff,
  Sync,
  Screenshot,
  RestartApp
}


export interface MessageBase {
  type: MessageTypes
}

export interface ActionMessage extends MessageBase {
  type: MessageTypes.Action
  action: ActionMessageTypes
}

export interface FileMessage extends MessageBase {
  type: MessageTypes.File
  fileName: string
  fileSize: number
  mimeType: string
  data: string // Base64
}

export interface NotificationMessage extends MessageBase {
  type: MessageTypes.Notification
  title: string
  text: string
}


export type WsMessage = ActionMessage | FileMessage | NotificationMessage


