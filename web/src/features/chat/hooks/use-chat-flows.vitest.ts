import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChatFlows } from "./use-chat-flows";
import { draftService } from "../api/draft-service";
import {
  MESSAGE_DRAFT_SENT_VIA,
  MESSAGE_DRAFT_STATUS,
} from "../types";

const toastMock = vi.fn();

vi.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("../api/draft-service", () => ({
  draftService: {
    sendDraft: vi.fn(),
    cancelDraft: vi.fn(),
    editDraft: vi.fn(),
  },
}));

describe("useChatFlows sendDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => {
    const client = new QueryClient();
    return React.createElement(QueryClientProvider, { client }, children);
  };

  it("sets sent state from API result and dispatches communication event", async () => {
    const sendDraftMock = vi.mocked(draftService.sendDraft);
    sendDraftMock.mockResolvedValue({
      message: "ok",
      sent_via: MESSAGE_DRAFT_SENT_VIA.SMS,
      draft: {
        id: "draft-1",
        recipient_name: "Client",
        recipient_phone: "+12065550123",
        message_type: "sms",
        body: "Hello",
        status: "sent",
        created_at: "2026-06-10T10:00:00Z",
        updated_at: "2026-06-10T10:00:02Z",
        sent_via: MESSAGE_DRAFT_SENT_VIA.SMS,
        sent_at: "2026-06-10T10:00:02Z",
        transaction_id: "tx-123",
      },
    });

    const { result } = renderHook(
      () => useChatFlows("chat-1", vi.fn(), async () => {}),
      { wrapper },
    );

    const pendingDraft = {
      id: "draft-1",
      recipient: { name: "Client", phone: "+12065550123" },
      messageType: "sms",
      body: "Hello",
      requiresConfirmation: true,
      status: MESSAGE_DRAFT_STATUS.PENDING,
      timestamp: new Date("2026-06-10T10:00:00Z"),
    };

    act(() => {
      result.current.setPendingDrafts([pendingDraft]);
    });

    const eventListener = vi.fn();
    window.addEventListener("subi:communication-sent", eventListener);

    await act(async () => {
      await result.current.sendDraft("draft-1");
    });

    const updatedDraft = result.current.pendingDrafts[0];
    expect(updatedDraft?.status).toBe(MESSAGE_DRAFT_STATUS.SENT);
    expect(updatedDraft?.sentVia).toBe(MESSAGE_DRAFT_SENT_VIA.SMS);
    expect(updatedDraft?.sentAt).toBeInstanceOf(Date);
    expect(eventListener).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Message Sent" }),
    );

    window.removeEventListener("subi:communication-sent", eventListener);
  });

  it("marks draft as failed when send errors", async () => {
    const sendDraftMock = vi.mocked(draftService.sendDraft);
    sendDraftMock.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(
      () => useChatFlows("chat-1", vi.fn(), async () => {}),
      { wrapper },
    );

    act(() => {
      result.current.setPendingDrafts([
        {
          id: "draft-2",
          recipient: { name: "Client", email: "client@example.com" },
          messageType: "email",
          subject: "Hello",
          body: "Body",
          requiresConfirmation: true,
          status: MESSAGE_DRAFT_STATUS.PENDING,
          timestamp: new Date("2026-06-10T10:00:00Z"),
        },
      ]);
    });

    await act(async () => {
      await result.current.sendDraft("draft-2");
    });

    expect(result.current.pendingDrafts[0]?.status).toBe(MESSAGE_DRAFT_STATUS.FAILED);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Send Failed" }),
    );
  });
});
