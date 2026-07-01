import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTransactionCommunications } from "./use-transaction-communications";
import { getTransactionCommunications } from "../api/communication-service";

vi.mock("../api/communication-service", () => ({
  getTransactionCommunications: vi.fn(),
}));

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useTransactionCommunications", () => {
  it("ignores stale responses after transaction switch", async () => {
    const apiMock = vi.mocked(getTransactionCommunications);
    const tx1 = deferred();
    const tx2 = deferred();

    apiMock.mockImplementation((transactionId) => {
      if (transactionId === "tx-1") return tx1.promise;
      return tx2.promise;
    });

    const { result, rerender } = renderHook(
      ({ id }) => useTransactionCommunications(id),
      { initialProps: { id: "tx-1" } },
    );

    rerender({ id: "tx-2" });

    await act(async () => {
      tx2.resolve({
        communications: [
          {
            id: "comm-tx2",
            message_type: "sms",
            recipient_name: "Buyer",
            recipient_email: null,
            recipient_phone: "+12065550123",
            subject: null,
            body: "tx2 message",
            sent_by: "subi",
            sent_at: "2026-06-10T10:00:00Z",
            cc_emails: [],
            recipient_type: "buyer",
          },
        ],
        meta: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 },
      });
      await Promise.resolve();
    });

    await act(async () => {
      tx1.resolve({
        communications: [
          {
            id: "comm-tx1",
            message_type: "email",
            recipient_name: "Seller",
            recipient_email: "seller@example.com",
            recipient_phone: null,
            subject: "tx1 message",
            body: "old transaction",
            sent_by: "subi",
            sent_at: "2026-06-10T09:00:00Z",
            cc_emails: [],
            recipient_type: "seller",
          },
        ],
        meta: { current_page: 1, total_pages: 1, total_count: 1, per_page: 10 },
      });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.communications).toHaveLength(1);
      expect(result.current.communications[0]?.id).toBe("comm-tx2");
    });
  });

  it("refreshes current transaction when communication sent event is emitted", async () => {
    const apiMock = vi.mocked(getTransactionCommunications);
    apiMock.mockResolvedValue({
      communications: [],
      meta: { current_page: 1, total_pages: 1, total_count: 0, per_page: 10 },
    });

    renderHook(() => useTransactionCommunications("tx-event"));

    let baselineCalls = 0;
    await waitFor(() => {
      expect(apiMock.mock.calls.length).toBeGreaterThan(0);
      baselineCalls = apiMock.mock.calls.length;
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent("subi:communication-sent", {
          detail: { transactionId: "tx-event" },
        }),
      );
    });

    await waitFor(() => {
      expect(apiMock.mock.calls.length).toBeGreaterThan(baselineCalls);
    });
  });
});
