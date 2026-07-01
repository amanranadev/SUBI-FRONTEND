import { ChatWebSocketService } from '@/services/chatWebSocketService';

jest.mock('@/Config', () => ({
  WEBSOCKET_URL: 'ws://chat.example.test/cable',
}));

jest.mock('@/services/authService', () => ({
  getToken: jest.fn(() => 'header.payload.signature'),
}));

type MessageEventPayload = { data: string };

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readonly url: string;
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEventPayload) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;

  send = jest.fn();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close = jest.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  });

  emitOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  emitMessage(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }

  emitClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  static reset() {
    MockWebSocket.instances = [];
  }
}

describe('ChatWebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    MockWebSocket.reset();
    (global as any).WebSocket = MockWebSocket;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('connect resolves only after subscription confirmation', async () => {
    const service = new ChatWebSocketService();
    const connectionStateChanges: boolean[] = [];
    service.onConnection((isConnected) => connectionStateChanges.push(isConnected));

    let resolved = false;
    const connectPromise = service.connect('header.payload.signature').then(() => {
      resolved = true;
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    const socket = MockWebSocket.instances[0];

    await Promise.resolve();
    expect(resolved).toBe(false);

    socket.emitOpen();

    const expectedSubscribeCommand = JSON.stringify({
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'ChatChannel' }),
    });

    expect(socket.send).toHaveBeenCalledWith(expectedSubscribeCommand);

    await Promise.resolve();
    expect(resolved).toBe(false);

    socket.emitMessage({ type: 'confirm_subscription' });
    await connectPromise;

    expect(resolved).toBe(true);
    expect(service.getConnectionStatus()).toBe(true);
    expect(connectionStateChanges).toEqual([false, true]);

    service.disconnect();
  });

  test('reconnects and resubscribes after transient close', async () => {
    const service = new ChatWebSocketService();

    const connectPromise = service.connect('header.payload.signature');
    const firstSocket = MockWebSocket.instances[0];

    firstSocket.emitOpen();
    firstSocket.emitMessage({ type: 'confirm_subscription' });
    await connectPromise;

    expect(service.getConnectionStatus()).toBe(true);

    firstSocket.emitClose();
    expect(service.getConnectionStatus()).toBe(false);

    jest.advanceTimersByTime(1000);

    expect(MockWebSocket.instances).toHaveLength(2);
    const secondSocket = MockWebSocket.instances[1];

    secondSocket.emitOpen();

    const expectedSubscribeCommand = JSON.stringify({
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'ChatChannel' }),
    });

    expect(secondSocket.send).toHaveBeenCalledWith(expectedSubscribeCommand);

    secondSocket.emitMessage({ type: 'confirm_subscription' });

    expect(service.getConnectionStatus()).toBe(true);

    service.disconnect();
  });

  test('normalizes ActionCable wrapped payloads and keeps draft callback behavior', async () => {
    const service = new ChatWebSocketService();
    const onDraftCreated = jest.fn();

    service.onDraftCreated(onDraftCreated);

    const connectPromise = service.connect('header.payload.signature');
    const socket = MockWebSocket.instances[0];

    socket.emitOpen();
    socket.emitMessage({ type: 'confirm_subscription' });
    await connectPromise;

    socket.emitMessage({
      identifier: JSON.stringify({ channel: 'ChatChannel' }),
      message: {
        type: 'message_draft_created',
        draft_id: 'draft-1',
        recipient: {
          name: 'Alex Escrow',
          email: 'alex@example.com',
        },
        message_type: 'email',
        subject: 'Escrow Open Request',
        body: 'Hello, please open escrow.',
      },
    });

    expect(onDraftCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'draft-1',
        recipient_name: 'Alex Escrow',
        recipient_email: 'alex@example.com',
        body: 'Hello, please open escrow.',
      })
    );

    service.disconnect();
  });

  test('preserves streaming and chat update callback behavior', async () => {
    const service = new ChatWebSocketService();
    const onStreaming = jest.fn();
    const onChatUpdated = jest.fn();
    const onTyping = jest.fn();

    service.onStreaming(onStreaming);
    service.onChatUpdated(onChatUpdated);
    service.onTyping(onTyping);

    const connectPromise = service.connect('header.payload.signature');
    const socket = MockWebSocket.instances[0];

    socket.emitOpen();
    socket.emitMessage({ type: 'confirm_subscription' });
    await connectPromise;

    socket.emitMessage({
      message: {
        type: 'ai_response_chunk',
        chat_id: 'chat-1',
        chunk: {
          chunk: 'Hello',
          chunk_index: 0,
          full_response_so_far: 'Hello',
          is_final: false,
        },
      },
    });

    socket.emitMessage({
      message: {
        type: 'chat_updated',
        chat_id: 'chat-1',
        messages: [
          {
            id: 'assistant-1',
            role: 'assistant',
            content: 'Hello there',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });

    expect(onStreaming).toHaveBeenCalledWith('chat-1', 'Hello', false);
    expect(onChatUpdated).toHaveBeenCalledWith(
      'chat-1',
      expect.arrayContaining([
        expect.objectContaining({
          id: 'assistant-1',
          role: 'assistant',
        }),
      ])
    );
    expect(onTyping).toHaveBeenCalledWith('chat-1', false);

    service.disconnect();
  });
});
