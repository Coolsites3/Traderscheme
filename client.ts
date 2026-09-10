type Handler = (data: any) => void;

export class DerivWSClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, Handler> = new Map();
  private requestId = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private token: string | null = null;
  connected = false;

  constructor(
    private appId: string,
    private endpoint: string = 'wss://ws.binaryws.com/websockets/v3'
  ) {}

  connect(token: string): Promise<any> {
    this.token = token;
    return new Promise((resolve, reject) => {
      const url = `${this.endpoint}?app_id=${this.appId}`;
      this.ws = new WebSocket(url);

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timed out'));
      }, 15000);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.send({ authorize: token })
          .then((auth) => {
            this.connected = true;
            clearTimeout(timeout);
            resolve(auth);
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      };

      this.ws.onmessage = (event) => {
        let data: any;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        const typeHandler = this.messageHandlers.get(data.msg_type || '');
        if (typeHandler) typeHandler(data);

        if (data.req_id) {
          const reqHandler = this.messageHandlers.get(`req_${data.req_id}`);
          if (reqHandler) reqHandler(data);
        }
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket error'));
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.handleReconnect();
      };
    });
  }

  private handleReconnect() {
    if (!this.token) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts += 1;
    const delay = 1000 * Math.min(this.reconnectAttempts, 30);
    setTimeout(() => {
      this.connect(this.token as string).catch(console.error);
    }, delay);
  }

  send(data: Record<string, unknown>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      const reqId = ++this.requestId;
      const payload = { ...data, req_id: reqId };
      const timer = setTimeout(() => {
        this.messageHandlers.delete(`req_${reqId}`);
        reject(new Error('Request timed out'));
      }, 20000);

      this.messageHandlers.set(`req_${reqId}`, (response) => {
        clearTimeout(timer);
        this.messageHandlers.delete(`req_${reqId}`);
        if (response.error) {
          reject(new Error(response.error.message || 'API error'));
        } else {
          resolve(response);
        }
      });

      this.ws.send(JSON.stringify(payload));
    });
  }

  on(msgType: string, handler: Handler) {
    this.messageHandlers.set(msgType, handler);
    return () => {
      if (this.messageHandlers.get(msgType) === handler) {
        this.messageHandlers.delete(msgType);
      }
    };
  }

  subscribeTicks(symbol: string, callback: (tick: any) => void) {
    let subscriptionId: string | null = null;

    const handler = (data: any) => {
      if (data.msg_type === 'tick' && data.tick?.symbol === symbol) {
        subscriptionId = data.subscription?.id || subscriptionId;
        callback(data.tick);
      }
    };

    this.messageHandlers.set(`tick:${symbol}`, handler);
    const wrapped = (data: any) => {
      const specific = this.messageHandlers.get(`tick:${symbol}`);
      if (specific) specific(data);
    };
    this.messageHandlers.set('tick', wrapped);

    this.send({ ticks: symbol, subscribe: 1 })
      .then((res) => {
        subscriptionId = res.subscription?.id || null;
        if (res.tick) callback(res.tick);
      })
      .catch(console.error);

    return () => {
      this.messageHandlers.delete(`tick:${symbol}`);
      if (subscriptionId) {
        this.send({ forget: subscriptionId }).catch(() => undefined);
      }
    };
  }

  disconnect() {
    this.token = null;
    this.connected = false;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}
