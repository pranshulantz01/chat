import { EventEmitter } from "./EventEmitter.js";
import type { IChatProvider } from "./providers/IProvider.js";
import { SocketIOProvider } from "./providers/SocketIO.js";
import type { ChatMessage, ConnectionStatus } from "./types.js";

interface ChatEvents {
  message: ChatMessage;
  status: ConnectionStatus;
  delivery: { tempId: string, finalMsg: ChatMessage }
}
export class ChatClient {
  private provider: IChatProvider;
  private messageListeners = new Set<(msg: ChatMessage) => void>();
  private deliveryListeners = new Set<
    (tempId: string, finalMsg: ChatMessage) => void
  >();
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private events = new EventEmitter<ChatEvents>();
  constructor(provider?: IChatProvider) {
    this.provider = provider || new SocketIOProvider();
    this.provider.onMessage((msg) => {
      this.events.emit('message', msg);
      this.messageListeners.forEach((cb) => cb(msg));
    });
    this.provider.onStatusChange((s) => {
      this.events.emit('status', s);
      this.statusListeners.forEach((cb) => cb(s));
    });
    this.provider.onMessageDelivered((tid, msg) => {
      this.events.emit('delivery', { tempId: tid, finalMsg: msg });
      this.deliveryListeners.forEach((cb) => cb(tid, msg));
    }
    );
  }

  connect(url: string, token: string) {
    this.provider.connect(url, token);
  }

  send(
    roomId: string,
    userId: string,
    text: string,
    metadata?: any,
  ): ChatMessage {
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      roomId,
      senderId: userId,
      text,
      timestamp: Date.now(),
      status: "pending",
      metadata,
    };
    this.provider.sendMessage(tempMsg);
    return tempMsg;
  }
  onMessage(cb: (msg: ChatMessage) => void) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }
  onDelivery(cb: (tid: string, msg: ChatMessage) => void) {
    this.deliveryListeners.add(cb);
    return () => this.deliveryListeners.delete(cb);
  }
  onStatusChange(cb: (status: ConnectionStatus) => void) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }
  destroy() {
    this.provider.disconnect();
  }
}
