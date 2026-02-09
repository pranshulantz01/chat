# com.testchat.p

A lightweight, extensible chat client library for modern JavaScript applications. Built with TypeScript, it provides a seamless interface for real-time messaging on both Web and React Native platforms.

## Features

- ⚡ **Real-time Messaging**: Powered by Socket.io for reliable, low-latency communication.
- 📦 **Framework Agnostic & React-Ready**: Core logic in pure TypeScript with a dedicated React Hook (`useChat`) for rapid integration.
- 📱 **React Native Support**: Built-in handling for connectivity and background/foreground transitions using `AppState`.
- 🛡️ **TypeScript First**: Full type safety for messages, connection statuses, and event listeners.
- ✨ **Optimistic UI**: Instant local feedback with message delivery confirmation tracking.
- 🔌 **Extensible**: Architecture allows for custom providers beyond Socket.io.

## Installation

```bash
npm install com.testchat.p
# or
yarn add com.testchat.p
```

### Peer Dependencies

If you are using the React hook, ensure you have `react` installed. For React Native, make sure you have `react-native` in your project.

## Quick Start

### 1. Using with React (Hook)

The `useChat` hook is the easiest way to integrate chat into your React or React Native application.

```tsx
import React, { useState } from 'react';
import { useChat } from 'com.testchat.p';

const ChatApp = () => {
  const url = 'https://your-chat-server.com';
  const token = 'your-auth-token';
  const userId = 'user-123';
  
  const { messages, status, sendMessage } = useChat(url, token, userId);

  const [input, setInput] = useState('');

  const handleSend = () => {
    sendMessage('room-456', input);
    setInput('');
  };

  return (
    <div>
      <p>Status: {status}</p>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <b>{msg.senderId}:</b> {msg.text} <i>({msg.status})</i>
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
```

### 2. Using the Core Client (Vanilla JS/TS)

For non-React environments or custom logic, use the `ChatClient` class directly.

```typescript
import { ChatClient } from 'com.testchat.p';

const client = new ChatClient();

// Listen for messages
client.onMessage((msg) => {
  console.log('New message:', msg);
});

// Watch connection status
client.onStatusChange((status) => {
  console.log('Connection status:', status);
});

// Connect
client.connect('https://your-server.com', 'auth-token');

// Send a message
const tempMsg = client.send('room-id', 'user-id', 'Hello World!');
console.log('Optimistic message sent:', tempMsg);
```

## API Reference

### `ChatClient`

The core class managing the chat lifecycle.

- `connect(url: string, token: string)`: Establishes connection to the server.
- `send(roomId: string, userId: string, text: string, metadata?: any)`: Sends a message and returns a temporary message object for optimistic UI updates.
- `onMessage(callback)`: Subscribe to incoming messages. Returns an unsubscribe function.
- `onStatusChange(callback)`: Subscribe to connection status changes (`CONNECTED`, `DISCONNECTED`, `CONNECTING`, `ERROR`).
- `onDelivery(callback)`: Subscribe to delivery confirmation events.
- `destroy()`: Disconnects and cleans up listeners.

### `useChat(url, token, userId)` (React Hook)

- **Parameters**:
  - `url`: Server WebSocket URL.
  - `token`: Authentication token.
  - `userId`: ID of the current user.
- **Returns**:
  - `messages`: Array of `ChatMessage` objects.
  - `status`: Current connection status.
  - `sendMessage(roomId, text, metadata)`: Helper function to send messages.

## Data Structures

### `ChatMessage`

```typescript
interface ChatMessage {
  id: string;        // Unique ID (temporary or server-generated)
  roomId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'error';
  metadata?: Record<string, any>;
}
```

## License
