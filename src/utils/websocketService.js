import axiosClient from "./axiosClient";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.isAuthenticated = false;
    this.messageHandlers = new Map();
    this.subscriptionHandlers = new Map();
    this.subscriptionId = 0;
    this.connectionPromise = null;
    this.isConnecting = false;
  }

  connect(token) {
    // If already connecting, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, return resolved promise
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    // Create new connection promise
    this.connectionPromise = new Promise((resolve, reject) => {
      this.isConnecting = true;

      // Use the same base URL as axios client
      const baseURL = axiosClient.defaults.baseURL;
      const wsProtocol = baseURL.startsWith("https") ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${baseURL.split("://")[1]}/api/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        // Send authentication command after connection is established
        const authCmdId = this.subscriptionId;
        const authCommand = {
          authCmd: {
            cmdId: authCmdId,
            token: token,
          },
        };
        this.ws.send(JSON.stringify(authCommand));
        this.reconnectAttempts = 0;
        this.isAuthenticated = true;
        this.isConnecting = false;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isAuthenticated = false;
        this.isConnecting = false;
        this.connectionPromise = null;
        this.handleReconnect(token);
        reject(new Error("WebSocket disconnected"));
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      };
    });

    return this.connectionPromise;
  }

  handleMessage(data) {
    // Handle telemetry subscription response
    if (data.subscriptionId !== undefined) {
      const subscription = this.subscriptionHandlers.get(data.subscriptionId);
      if (subscription) {
        // Format the data for the handler
        const formattedData = {
          errorCode: data.errorCode,
          errorMsg: data.errorMsg,
          data: data.data || {},
          latestValues: data.latestValues || {},
        };

        // Call the handler with the formatted data
        subscription.handler(formattedData);

        // If there's an error, log it
        if (data.errorCode !== 0) {
          console.error(
            `Subscription error for device ${subscription.deviceId}:`,
            data.errorMsg
          );
        }
      }
      return;
    }

    // Handle other message types
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => this.connect(token), this.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  subscribe(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  unsubscribe(type) {
    this.messageHandlers.delete(type);
  }

  subscribeToDeviceTelemetry(deviceId, handler) {
    console.log("Subscribing to device telemetry for device:", deviceId);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return null;
    }

    this.subscriptionId++;
    const subscriptionId = this.subscriptionId;

    // Create subscription message
    const subscriptionMessage = {
      cmds: [
        {
          type: "TIMESERIES",
          entityType: "DEVICE",
          entityId: deviceId,
          scope: "LATEST_TELEMETRY",
          cmdId: subscriptionId,
        },
      ],
    };

    // Store the handler with the subscription ID and device ID
    this.subscriptionHandlers.set(subscriptionId, {
      handler,
      deviceId,
      message: subscriptionMessage,
    });

    // Send subscription message
    this.send(subscriptionMessage);

    return subscriptionId;
  }

  unsubscribeFromDeviceTelemetry(deviceId, subscriptionId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    // Create unsubscribe message with the same cmdId as subscription
    const unsubscribeMessage = {
      cmds: [
        {
          type: "TIMESERIES",
          entityType: "DEVICE",
          entityId: deviceId,
          scope: "LATEST_TELEMETRY",
          cmdId: subscriptionId,
          unsubscribe: true,
        },
      ],
    };

    // Send unsubscribe message
    this.send(unsubscribeMessage);

    // Remove the handler
    this.subscriptionHandlers.delete(subscriptionId);
    console.log("Unsubscribed from device telemetry for device:", deviceId);
  }

  async send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const token = localStorage.getItem("token");
      if (token) {
        await this.connect(token);
      } else {
        console.error("No authentication token available");
        return;
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isAuthenticated = false;
      this.messageHandlers.clear();
      this.subscriptionHandlers.clear();
      this.connectionPromise = null;
      this.isConnecting = false;
    }
  }

  isConnected() {
    return (
      this.ws && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated
    );
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
