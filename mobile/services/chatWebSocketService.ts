import { WEBSOCKET_URL } from '@/Config';
import { ChatMessage, ChatWebSocketMessage, MessageDraft } from '@/types/chat';
import { getToken } from './authService';

// Callback types
type ConnectionCallback = (isConnected: boolean) => void;
type MessageCallback = (message: ChatWebSocketMessage) => void;
type TypingCallback = (chatId: string, isTyping: boolean) => void;
type StreamingCallback = (chatId: string, content: string, isFinal: boolean) => void;
type ChatUpdatedCallback = (chatId: string, messages: ChatMessage[]) => void;
type DraftCreatedCallback = (draft: MessageDraft) => void;
type ErrorCallback = (error: { message: string; chatId?: string }) => void;

type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected_unsubscribed'
  | 'subscribed';

const CONNECTION_TIMEOUT_MS = 15000;
const SUBSCRIPTION_TIMEOUT_MS = 8000;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export class ChatWebSocketService {
  private websocket: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';

  private connectionPromise: Promise<void> | null = null;
  private connectionPromiseResolve: (() => void) | null = null;
  private connectionPromiseReject: ((error: Error) => void) | null = null;

  private tokenForReconnect: string | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyDisconnected = false;

  // Callback arrays
  private connectionCallbacks: ConnectionCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private typingCallbacks: TypingCallback[] = [];
  private streamingCallbacks: StreamingCallback[] = [];
  private chatUpdatedCallbacks: ChatUpdatedCallback[] = [];
  private draftCreatedCallbacks: DraftCreatedCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private activeChatIdByJobId = new Map<string, string>();

  async connect(jwtToken?: string): Promise<void> {
    const token = jwtToken || this.tokenForReconnect || getToken();

    if (!token) {
      throw new Error('No authentication token available');
    }

    this.validateToken(token);

    this.tokenForReconnect = token;
    this.manuallyDisconnected = false;

    if (this.isSocketReady()) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionPromiseResolve = resolve;
      this.connectionPromiseReject = reject;
    });

    this.startConnectionAttempt();

    return this.connectionPromise;
  }

  private validateToken(token: string): void {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
  }

  private isSocketReady(): boolean {
    return (
      this.connectionState === 'subscribed' &&
      this.websocket?.readyState === WebSocket.OPEN
    );
  }

  private setConnectionState(nextState: ConnectionState): void {
    const wasReady = this.connectionState === 'subscribed';
    const isReady = nextState === 'subscribed';
    this.connectionState = nextState;

    if (wasReady !== isReady) {
      this.notifyConnectionCallbacks(isReady);
    }
  }

  private startConnectionAttempt(): void {
    if (!this.tokenForReconnect) {
      this.rejectPendingConnection(
        new Error('No authentication token available for reconnect')
      );
      return;
    }

    this.clearReconnectTimer();
    this.clearConnectionTimeout();
    this.clearSubscriptionTimeout();
    this.disposeSocket(false);

    this.setConnectionState('connecting');

    const wsUrl = WEBSOCKET_URL || 'ws://127.0.0.1:8080/cable';
    const fullUrl = `${wsUrl}?token=${this.tokenForReconnect}`;

    try {
      const socket = new WebSocket(fullUrl);
      this.websocket = socket;

      this.connectionTimeoutTimer = setTimeout(() => {
        if (this.connectionState !== 'subscribed') {
          this.notifyErrorCallbacks({ message: 'Chat connection timeout. Retrying...' });
          this.closeActiveSocket();
        }
      }, CONNECTION_TIMEOUT_MS);

      socket.onopen = () => {
        if (this.websocket !== socket) {
          return;
        }

        this.setConnectionState('connected_unsubscribed');
        this.sendSubscribeCommand();
      };

      socket.onmessage = (event) => {
        if (this.websocket !== socket) {
          return;
        }

        try {
          const data = JSON.parse(event.data);
          console.log('📩 [ChatWS] Raw incoming:', JSON.stringify(data, null, 2));
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse chat WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        if (this.websocket !== socket) {
          return;
        }

        this.clearConnectionTimeout();
        this.clearSubscriptionTimeout();
        this.websocket = null;
        this.setConnectionState('disconnected');

        if (this.manuallyDisconnected) {
          this.rejectPendingConnection(new Error('Chat WebSocket disconnected'));
          return;
        }

        this.scheduleReconnect();
      };

      socket.onerror = () => {
        if (this.websocket !== socket) {
          return;
        }

        this.notifyErrorCallbacks({ message: 'WebSocket connection error' });
      };
    } catch (error) {
      this.notifyErrorCallbacks({ message: 'Failed to initialize WebSocket connection' });
      this.scheduleReconnect();
    }
  }

  private sendSubscribeCommand(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const subscribeMessage = {
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'ChatChannel' }),
    };

    this.websocket.send(JSON.stringify(subscribeMessage));

    this.clearSubscriptionTimeout();
    this.subscriptionTimeoutTimer = setTimeout(() => {
      if (this.connectionState !== 'subscribed') {
        this.notifyErrorCallbacks({
          message: 'Chat subscription confirmation timeout. Reconnecting...',
        });
        this.closeActiveSocket();
      }
    }, SUBSCRIPTION_TIMEOUT_MS);
  }

  private closeActiveSocket(): void {
    if (!this.websocket) {
      return;
    }

    if (
      this.websocket.readyState === WebSocket.OPEN ||
      this.websocket.readyState === WebSocket.CONNECTING
    ) {
      this.websocket.close();
    }
  }

  private disposeSocket(sendUnsubscribe: boolean): void {
    if (!this.websocket) {
      return;
    }

    const socket = this.websocket;
    this.websocket = null;

    if (
      sendUnsubscribe &&
      this.connectionState === 'subscribed' &&
      socket.readyState === WebSocket.OPEN
    ) {
      const unsubscribeMessage = {
        command: 'unsubscribe',
        identifier: JSON.stringify({ channel: 'ChatChannel' }),
      };
      socket.send(JSON.stringify(unsubscribeMessage));
    }

    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;

    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  }

  private scheduleReconnect(): void {
    if (this.manuallyDisconnected || !this.tokenForReconnect) {
      this.rejectPendingConnection(
        new Error('Chat WebSocket disconnected and cannot reconnect')
      );
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS
    );
    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.startConnectionAttempt();
    }, delay);
  }

  private handleMessage(rawData: unknown): void {
    const wsMessage = this.normalizeIncomingMessage(rawData);

    if (!wsMessage) {
      return;
    }

    console.log('📨 [ChatWS] Normalized message:', wsMessage.type, JSON.stringify(wsMessage, null, 2));

    if (wsMessage.type === 'subscription_confirmed') {
      this.handleSubscriptionConfirmed();
    }

    this.notifyMessageCallbacks(wsMessage);

    switch (wsMessage.type) {
      case 'job_started': {
        const jobParams = wsMessage.job_params as { user_chat_id?: string } | undefined;
        const userChatId = jobParams?.user_chat_id;
        if (userChatId && wsMessage.job_id) {
          this.activeChatIdByJobId.set(wsMessage.job_id, userChatId);
        }
        break;
      }

      case 'chat_updated':
        if (wsMessage.chat_id && wsMessage.messages) {
          this.notifyChatUpdatedCallbacks(wsMessage.chat_id, wsMessage.messages);
        }
        if (wsMessage.chat_id) {
          this.notifyTypingCallbacks(wsMessage.chat_id, false);
        }
        break;

      case 'typing_status':
        if (wsMessage.chat_id !== undefined && wsMessage.is_typing !== undefined) {
          this.notifyTypingCallbacks(wsMessage.chat_id, wsMessage.is_typing);
        }
        break;

      case 'ai_response_chunk': {
        const chunk = wsMessage.chunk;
        const chatId =
          wsMessage.chat_id ||
          (typeof chunk?.chat_id === 'string' ? chunk.chat_id : undefined) ||
          (wsMessage.job_id ? this.activeChatIdByJobId.get(wsMessage.job_id) : undefined);

        if (chatId && chunk) {
          this.notifyStreamingCallbacks(
            chatId,
            chunk.full_response_so_far,
            chunk.is_final
          );

          if (chunk.is_final && wsMessage.job_id) {
            this.activeChatIdByJobId.delete(wsMessage.job_id);
          }
        }
        break;
      }

      case 'message_draft_created':
        if (wsMessage.draft_id && wsMessage.recipient && wsMessage.body) {
          const draft: MessageDraft = {
            id: wsMessage.draft_id,
            recipient_name: wsMessage.recipient.name,
            recipient_email: wsMessage.recipient.email,
            recipient_phone: wsMessage.recipient.phone,
            message_type: wsMessage.message_type || 'email',
            subject: wsMessage.subject,
            body: wsMessage.body,
            status: 'pending',
            created_at: wsMessage.timestamp || new Date().toISOString(),
            cc_emails: wsMessage.cc_emails,
          };
          this.notifyDraftCreatedCallbacks(draft);
        }
        break;

      case 'job_failed':
        this.notifyErrorCallbacks({
          message: wsMessage.error || 'AI response failed',
          chatId: wsMessage.chat_id,
        });
        if (wsMessage.chat_id) {
          this.notifyTypingCallbacks(wsMessage.chat_id, false);
        }
        break;

      case 'error':
        this.notifyErrorCallbacks({
          message: wsMessage.error || 'An error occurred',
          chatId: wsMessage.chat_id,
        });
        break;
    }
  }

  private normalizeIncomingMessage(rawData: unknown): ChatWebSocketMessage | null {
    if (!rawData || typeof rawData !== 'object') {
      return null;
    }

    const data = rawData as Record<string, unknown>;

    if (data.type === 'ping' || data.type === 'welcome') {
      return null;
    }

    if (data.type === 'confirm_subscription') {
      return { type: 'subscription_confirmed' };
    }

    if (data.type === 'reject_subscription') {
      return {
        type: 'error',
        error: 'Chat subscription rejected',
      };
    }

    const wrappedMessage = (data.message as Record<string, unknown> | undefined) || data;
    if (!wrappedMessage || typeof wrappedMessage !== 'object') {
      return null;
    }

    const messageType = wrappedMessage.type;
    if (typeof messageType !== 'string') {
      return null;
    }

    if (messageType === 'ping' || messageType === 'welcome') {
      return null;
    }

    return wrappedMessage as unknown as ChatWebSocketMessage;
  }

  private handleSubscriptionConfirmed(): void {
    this.clearConnectionTimeout();
    this.clearSubscriptionTimeout();
    this.reconnectAttempt = 0;
    this.setConnectionState('subscribed');
    this.resolvePendingConnection();
  }

  disconnect(): void {
    this.manuallyDisconnected = true;
    this.tokenForReconnect = null;

    this.clearReconnectTimer();
    this.clearConnectionTimeout();
    this.clearSubscriptionTimeout();

    this.rejectPendingConnection(new Error('Chat WebSocket disconnected'));
    this.disposeSocket(true);
    this.activeChatIdByJobId.clear();
    this.setConnectionState('disconnected');
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  private clearSubscriptionTimeout(): void {
    if (this.subscriptionTimeoutTimer) {
      clearTimeout(this.subscriptionTimeoutTimer);
      this.subscriptionTimeoutTimer = null;
    }
  }

  private resolvePendingConnection(): void {
    if (this.connectionPromiseResolve) {
      this.connectionPromiseResolve();
    }

    this.connectionPromise = null;
    this.connectionPromiseResolve = null;
    this.connectionPromiseReject = null;
  }

  private rejectPendingConnection(error: Error): void {
    if (this.connectionPromiseReject) {
      this.connectionPromiseReject(error);
    }

    this.connectionPromise = null;
    this.connectionPromiseResolve = null;
    this.connectionPromiseReject = null;
  }

  // Callback notification methods
  private notifyConnectionCallbacks(isConnected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(isConnected));
  }

  private notifyMessageCallbacks(message: ChatWebSocketMessage): void {
    this.messageCallbacks.forEach((cb) => cb(message));
  }

  private notifyTypingCallbacks(chatId: string, isTyping: boolean): void {
    this.typingCallbacks.forEach((cb) => cb(chatId, isTyping));
  }

  private notifyStreamingCallbacks(chatId: string, content: string, isFinal: boolean): void {
    this.streamingCallbacks.forEach((cb) => cb(chatId, content, isFinal));
  }

  private notifyChatUpdatedCallbacks(chatId: string, messages: ChatMessage[]): void {
    this.chatUpdatedCallbacks.forEach((cb) => cb(chatId, messages));
  }

  private notifyDraftCreatedCallbacks(draft: MessageDraft): void {
    this.draftCreatedCallbacks.forEach((cb) => cb(draft));
  }

  private notifyErrorCallbacks(error: { message: string; chatId?: string }): void {
    this.errorCallbacks.forEach((cb) => cb(error));
  }

  // Callback registration methods (return unsubscribe function)
  onConnection(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    callback(this.connectionState === 'subscribed');
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((cb) => cb !== callback);
    };
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onTyping(callback: TypingCallback): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter((cb) => cb !== callback);
    };
  }

  onStreaming(callback: StreamingCallback): () => void {
    this.streamingCallbacks.push(callback);
    return () => {
      this.streamingCallbacks = this.streamingCallbacks.filter((cb) => cb !== callback);
    };
  }

  onChatUpdated(callback: ChatUpdatedCallback): () => void {
    this.chatUpdatedCallbacks.push(callback);
    return () => {
      this.chatUpdatedCallbacks = this.chatUpdatedCallbacks.filter((cb) => cb !== callback);
    };
  }

  onDraftCreated(callback: DraftCreatedCallback): () => void {
    this.draftCreatedCallbacks.push(callback);
    return () => {
      this.draftCreatedCallbacks = this.draftCreatedCallbacks.filter((cb) => cb !== callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Status getters
  getConnectionStatus(): boolean {
    return this.connectionState === 'subscribed';
  }

  isSubscribed(): boolean {
    return this.connectionState === 'subscribed';
  }
}

const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;
