import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage, ConnectionStatus } from '../core/types.js';
import { ChatClient } from '../core/ChatClient.js';

// AppState detection for React Native
let AppState: any = null;
try {
  // Use require for better Metro compatibility in library code
  const RN = require('react-native');
  AppState = RN.AppState;
} catch (e) {
  // Not in a React Native environment
}

export function useChat(url: string, token: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const clientRef = useRef(new ChatClient());

  useEffect(() => {
    // Basic environment check
    if (typeof window === 'undefined' && !AppState) return;

    const client = clientRef.current;
    client.connect(url, token);

    const unbindMsg = client.onMessage((msg: any) => setMessages((prev: any) => [...prev, msg]));

    const unbindDelivery = client.onDelivery((tempId: any, finalMsg: any) => {
      setMessages((prev: any) => prev.map((m: any) => m.id === tempId ? finalMsg : m));
    });

    const unbindStatus = client.onStatusChange((s: ConnectionStatus) => setStatus(s));

    let sub: any;
    if (AppState) {
      sub = AppState.addEventListener('change', (nextAppState: string) => {
        if (nextAppState === 'active') {
          client.connect(url, token);
        }
      });
    }

    return () => {
      unbindMsg();
      unbindDelivery();
      unbindStatus();
      client.destroy();
      if (sub && sub.remove) sub.remove();
    };
  }, [url, token]);

  const sendMessage = useCallback((roomId: string, text: string, metadata?: any) => {
    // Fixed parameter order: roomId, userId, text, metadata
    const temp = clientRef.current.send(roomId, userId, text, metadata);
    setMessages((prev: any) => [...prev, temp]);
    return temp;
  }, [userId]);

  return { messages, status, sendMessage };
}