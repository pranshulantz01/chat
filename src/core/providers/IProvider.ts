import type { ChatMessage, ConnectionStatus } from "../types.js";

export interface IChatProvider {
    connect(url: string, token: string): void;
    disconnect(): void;
    sendMessage(message: ChatMessage): void;
    onMessage(callback: (msg: ChatMessage) => void): void;

    onMessageDelivered(
        callback: (tempId: string, finalMsg: ChatMessage) => void,
    ): void;
    onStatusChange(callback: (status: ConnectionStatus) => void): void;
}