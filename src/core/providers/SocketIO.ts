
import { io, Socket } from "socket.io-client";
import type { ChatMessage, ConnectionStatus } from "../types.js";
import type { IChatProvider } from "./IProvider.js";

export class SocketIOProvider implements IChatProvider {
  private socket: Socket | null = null;
  private onMessageCallback: ((msg: ChatMessage) => void) | null = null;
  private onDeliveryCallback: ((tempId: string, finalMsg: ChatMessage) => void) | null = null;
  private onStatusCallback: ((status: ConnectionStatus) => void) | null = null;

  connect(url: string, token: string): void {
    if (this.socket?.connected) return;

    // If there was a previous socket, disconnect it
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(url, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true
    });

    // Re-attach all listeners to the new socket instance
    this.attachListeners();
  }

  private attachListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[SocketIOProvider] Connected");
      this.onStatusCallback?.("CONNECTED");
    });

    this.socket.on("disconnect", () => {
      console.log("[SocketIOProvider] Disconnected");
      this.onStatusCallback?.("DISCONNECTED");
    });

    this.socket.on("connect_error", (err) => {
      console.error("[SocketIOProvider] Connect Error:", err);
      this.onStatusCallback?.("ERROR");
    });

    this.socket.on("message:receive", (data: any) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(this.mapToSDK(data));
      }
    });

    this.socket.on("message:ack", (response: { tempId: string; data: any }) => {
      if (this.onDeliveryCallback) {
        this.onDeliveryCallback(response.tempId, this.mapToSDK(response.data));
      }
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  sendMessage(message: ChatMessage): void {
    if (!this.socket) {
      console.warn("[SocketIOProvider] Cannot send message: No socket instance");
      return;
    }
    this.socket.emit("message:send", message);
  }

  onMessage(callback: (msg: ChatMessage) => void): void {
    this.onMessageCallback = callback;
    // If socket already exists, we could bind here too, but connect() handles it
  }

  onMessageDelivered(
    callback: (tempId: string, finalMsg: ChatMessage) => void,
  ): void {
    this.onDeliveryCallback = callback;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.onStatusCallback = callback;
    // Immediately report current status if socket exists
    if (this.socket?.connected) {
      callback("CONNECTED");
    } else {
      callback("DISCONNECTED");
    }
  }

  private mapToSDK(data: any): ChatMessage {
    return {
      id: data.uuid || data.id,
      roomId: data.room_id || data.roomId,
      senderId: data.author_id || data.senderId,
      text: data.body || data.text,
      timestamp: data.created_at || data.timestamp,
      metadata: data.meta || data.metadata || {},
      status: "sent"
    }
  }
}
