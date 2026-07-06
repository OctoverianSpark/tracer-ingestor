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
  isRdp: boolean;
  connectedAt: Date;
  appuser_id: bigint;
}


export enum MessageTypes {

  Action,
  File,
  Notification,
  SyncData,
  UserInfo
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

/** Enviado por el agente en respuesta a ActionMessageTypes.Sync, con el estado actual de la máquina. */
export interface SyncDataMessage extends MessageBase {
  type: MessageTypes.SyncData
  hostname?: string
  ip?: string
  username?: string
  machineBrand?: string
  machineModel?: string
}

/** Respuesta del servidor al SyncDataMessage, con los datos del usuario asignado a la máquina. */
export interface UserInfoMessage extends MessageBase {
  type: MessageTypes.UserInfo
  appuser_id: string | null
  full_name: string | null
  email: string | null
  role: string | null
  access_level: unknown | null
  group: string | null
  absence_status: string | null
}


export type WsMessage = ActionMessage | FileMessage | NotificationMessage | SyncDataMessage | UserInfoMessage

export interface DashboardConnection {
  ws: WebSocket
  id: string
  isAlive: boolean
  connectedAt: Date
}

export type DashboardEvent =
  | { event: 'machine_online';      data: { serial: string; hostname: string; ip: string; username: string; appuser_id: string } }
  | { event: 'machine_offline';     data: { serial: string; hostname: string } }
  | { event: 'user_status_changed'; data: { appuser_id: string; absence_status: string | null } }


