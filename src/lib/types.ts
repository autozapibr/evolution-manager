export interface Instance {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
  integration: string;
  phoneNumber?: string;
  token?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    Message: number;
    Contact: number;
    Chat: number;
  };
  Setting?: {
    id: string;
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
    instanceId: string;
  };
}

export interface ApiResponse<T = unknown> {
  status?: number;
  error?: string;
  response?: T;
}

export interface CreateInstancePayload {
  instanceName: string;
  webhook_by_events?: boolean;
  qrcode: boolean;
  integration: string;
  token?: string;
  phoneNumber?: string;
}

export interface PresencePayload {
  presence: "available" | "unavailable" | "composing" | "recording" | "paused";
}

export interface QRCodeResponse {
  qrcode?: string; // The QR code string
  base64: string; // The base64 image data
  pairingCode?: string; // Optional pairing code
  connected?: boolean; // Whether the connection was successful
}

export interface TypebotConfig {
  id?: string;
  enabled: boolean;
  url: string;
  typebot: string;
  description: string;
  triggerType: "keyword" | "all";
  triggerOperator?: "contains" | "equals" | "startsWith" | "endsWith" | "regex";
  triggerValue?: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  createdAt?: string;
  updatedAt?: string;
  ignoreJids?: string[];
  instanceId?: string;
}

export interface TypebotStartPayload {
  url: string;
  typebot: string;
  remoteJid: string;
  startSession: boolean;
  variables?: Array<{
    name: string;
    value: string;
  }>;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  headers: {
    [key: string]: string;
  };
  byEvents: boolean;
  base64: boolean;
  events: WebhookEventType[];
}

export type WebhookEventType =
  | "APPLICATION_STARTUP"
  | "QRCODE_UPDATED"
  | "MESSAGES_SET"
  | "MESSAGES_UPSERT"
  | "MESSAGES_UPDATE"
  | "MESSAGES_DELETE"
  | "SEND_MESSAGE"
  | "CONTACTS_SET"
  | "CONTACTS_UPSERT"
  | "CONTACTS_UPDATE"
  | "PRESENCE_UPDATE"
  | "CHATS_SET"
  | "CHATS_UPSERT"
  | "CHATS_UPDATE"
  | "CHATS_DELETE"
  | "GROUPS_UPSERT"
  | "GROUP_UPDATE"
  | "GROUP_PARTICIPANTS_UPDATE"
  | "CONNECTION_UPDATE"
  | "LABELS_EDIT"
  | "LABELS_ASSOCIATION"
  | "CALL"
  | "TYPEBOT_START"
  | "TYPEBOT_CHANGE_STATUS";

export interface OpenAICredential {
  id?: string;
  name: string;
  apiKey: string;
  createdAt?: string;
  updatedAt?: string;
  instanceId?: string;
}

export interface Chatbot {
  id?: string;
  name?: string;
  enabled: boolean;
  openaiCredsId: string;
  description: string;
  botType: "assistant" | "chatCompletion";
  // For assistants
  assistantId?: string;
  functionUrl?: string;
  // For chat completion
  model: string;
  systemMessages?: string[];
  assistantMessages?: string[];
  userMessages?: string[];
  maxTokens: number;
  // Options
  triggerType: "keyword" | "all";
  triggerOperator:
    | "contains"
    | "equals"
    | "startsWith"
    | "endsWith"
    | "regex"
    | "none";
  triggerValue: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  splitMessages?: boolean;
  timePerChar?: number;
  ignoreJids?: string[];
  createdAt?: string;
  updatedAt?: string;
  instanceId?: string;
}

export interface License {
  key: string;
  validUntil: string;
  isValid: boolean;
  createdAt: string;
}
