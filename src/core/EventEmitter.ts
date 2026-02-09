type Listener = (...args: any[]) => void;

export class EventEmitter<T extends Record<string, any>> {
  private eventMap: Map<keyof T, Set<Listener>> = new Map();

  /**
   * Subscribe to an event
   * Returns an unsubscribe function for easy cleanup in useEffect
   */
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Set());
    }
    this.eventMap.get(event)!.add(listener);

    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    const listeners = this.eventMap.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Trigger an event
   */
  emit<K extends keyof T>(event: K, data: T[K]) {
    const listeners = this.eventMap.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Clear all listeners (useful when destroying the ChatClient)
   */
  clear() {
    this.eventMap.clear();
  }
}