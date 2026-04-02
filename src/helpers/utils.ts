import { ActionMessageTypes, MessageTypes, type ActionMessage, type FileMessage, type NotificationMessage, type WsMessage } from "../types/tracer.js"

export const createAction = (action: ActionMessageTypes): WsMessage => ({
  type: MessageTypes.Action,
  action
} as ActionMessage)

export const createNotification = (title: string, text: string): WsMessage => ({
  type: MessageTypes.Notification,
  title,
  text
} as NotificationMessage)

export const createFile = (
  fileName: string,
  fileSize: number,
  mimeType: string,
  data: string
): WsMessage => ({
  type: MessageTypes.File,
  fileName,
  fileSize,
  mimeType,
  data
} as FileMessage)