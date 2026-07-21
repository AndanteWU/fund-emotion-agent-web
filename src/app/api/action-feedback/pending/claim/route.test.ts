import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

import { POST } from "./route";

describe("POST /api/action-feedback/pending/claim", () => {
  it("returns 401 when there is no authenticated Supabase user", async () => {
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({
      status: "error",
      code: "unauthenticated",
      message: "请先登录后再查看待反馈行动。",
    });
  });
});
