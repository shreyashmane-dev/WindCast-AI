/**
 * Reconnecting WebSocket Service for WindCast AI.
 * Handles stable real-time streaming, exponential backoff reconnections,
 * and active ping-pong heartbeats to keep proxy ports open.
 */

const DEFAULT_WS_URL = "ws://localhost:8000/api/v1/forecast/live";

export class ReconnectingWebSocket {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectInterval = 1000;
  private maxReconnectInterval = 16000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  
  // Callbacks
  public onMessage: (data: any) => void = () => {};
  public onStatusChange: (status: "connecting" | "connected" | "disconnected") => void = () => {};

  constructor(customUrl?: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    // Construct WS URL from HTTP endpoint
    const wsBase = baseUrl.replace(/^http/, "ws");
    this.url = customUrl || `${wsBase}/forecast/live`;
  }

  /**
   * Triggers connection setup.
   */
  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    this.onStatusChange("connecting");
    
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      this.handleDisconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.onStatusChange("connected");
      this.reconnectInterval = 1000; // Reset backoff
      this.isConnecting = false;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload === "pong") return; // Ignore heartbeat responses
        this.onMessage(payload);
      } catch (err) {
        console.error("Failed to parse WebSocket message packet:", err);
      }
    };

    this.ws.onclose = () => {
      this.handleDisconnect();
    };

    this.ws.onerror = () => {
      this.handleDisconnect();
    };
  }

  private handleDisconnect() {
    this.ws = null;
    this.stopHeartbeat();
    this.onStatusChange("disconnected");

    // Queue reconnection using exponential backoff
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        
        // Double interval up to ceiling limit
        this.reconnectInterval = Math.min(
          this.reconnectInterval * 2,
          this.maxReconnectInterval
        );
        
        console.log(`Re-establishing WebSocket connection link in ${this.reconnectInterval}ms...`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  /**
   * Starts a 20-second active ping loop to bypass server idling policies.
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Broadcasts commands down to the backend on the fly (e.g. switching active model).
   */
  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  /**
   * Safely closes the channel.
   */
  public disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
export const wsService = new ReconnectingWebSocket();
