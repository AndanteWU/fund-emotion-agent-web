import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

import { PATCH } from "./route";

describe("PATCH /api/action-feedback/[actionId]/feedback", () => {
  it("returns 401 when there is no authenticated Supabase user", async () => {
    const request = new Request(
      "http://localhost/api/action-feedback/7cf411fa-213d-46a0-94ec-46629729d65e/feedback",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ feedback: "helpful" }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        actionId: "7cf411fa-213d-46a0-94ec-46629729d65e",
      }),
    });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({
      status: "error",
      code: "unauthenticated",
      message: "请先登录后再提交行动反馈。",
    });
  });
});
