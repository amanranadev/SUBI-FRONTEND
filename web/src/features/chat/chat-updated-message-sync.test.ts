import { describe, expect, it } from "vitest"
import { mapChatUpdatedMessages } from "./chat-updated-message-sync"

describe("mapChatUpdatedMessages", () => {
  it("maps valid backend chat_updated messages", () => {
    const mapped = mapChatUpdatedMessages([
      {
        id: "msg-1",
        role: "assistant",
        content: "Message has been sent! Would you like me to draft a Congrats & Next Steps email to your client?",
        timestamp: "2026-05-22T12:00:00Z",
      },
    ])

    expect(mapped).toHaveLength(1)
    expect(mapped[0]).toMatchObject({
      id: "msg-1",
      isAi: true,
      text: "Message has been sent! Would you like me to draft a Congrats & Next Steps email to your client?",
    })
  })

  it("ignores invalid payload entries and dedupes by id", () => {
    const mapped = mapChatUpdatedMessages([
      {
        id: "msg-1",
        role: "assistant",
        content: "first",
        timestamp: "2026-05-22T12:00:00Z",
      },
      {
        id: "msg-1",
        role: "assistant",
        content: "latest",
        timestamp: "2026-05-22T12:01:00Z",
      },
      {
        id: "invalid-role",
        role: "system",
        content: "ignore me",
        timestamp: "2026-05-22T12:01:00Z",
      },
      {
        id: "bad-content",
        role: "assistant",
        content: 123,
        timestamp: "2026-05-22T12:01:00Z",
      },
    ])

    expect(mapped).toHaveLength(1)
    expect(mapped[0]?.id).toBe("msg-1")
    expect(mapped[0]?.text).toBe("latest")
  })
})
