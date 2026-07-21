import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
    },
  }),
}));

import { POST } from "./route";

describe("POST /api/action-feedback/decision", () => {
  it("returns 401 when there is no authenticated Supabase user", async () => {
    const request = new Request("http://localhost/api/action-feedback/decision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reviewId: "10d7c53f-7488-4198-b0c2-60e6d9c30a86",
        patternType: "rising_anxiety",
        observationTitle: "焦虑程度持续上升",
        observationEvidence: [
          {
            label: "模式证据",
            value: "焦虑评分从 3 分上升到 7 分。",
            dates: ["2026-07-18", "2026-07-19", "2026-07-20"],
          },
        ],
        sourceStartDate: "2026-06-22",
        sourceEndDate: "2026-07-21",
        actionTitle: "记录触发因素",
        actionInstruction: "写下焦虑升高前发生的事情。",
        decision: "accepted",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({
      status: "error",
      code: "unauthenticated",
      message: "请先登录后再保存行动选择。",
    });
  });
});
