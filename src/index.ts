// Core exports
export { ChatClient } from './core/ChatClient.js';
export { EventEmitter } from './core/EventEmitter.js';
export { SocketIOProvider } from './core/providers/SocketIO.js';

// Types
export type { ChatMessage, ConnectionStatus } from './core/types.js';
export type { IChatProvider } from './core/providers/IProvider.js';

// Hooks
export { useChat } from './hooks/useChat.js';
