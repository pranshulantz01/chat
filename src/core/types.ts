export type ConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: "pending" | "sent" | "error";
  metadata?: Record<string, any>;
}

