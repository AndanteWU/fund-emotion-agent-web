import { NextResponse } from "next/server";
import { actionDecisionRequestSchema } from "@/features/action-feedback/schemas";
import { saveActionDecision } from "@/features/action-feedback/services/action-feedback-service";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        code: "invalid_request",
        message: "行动选择内容无效，请刷新后重试。",
      },
      { status: 400 },
    );
  }

  const parsed = actionDecisionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "error",
        code: "invalid_request",
        message: "行动选择内容无效，请刷新后重试。",
      },
      { status: 400 },
    );
  }

  const result = await saveActionDecision(parsed.data);

  if (result.status === "unauthenticated") {
    return NextResponse.json(
      {
        status: "error",
        code: "unauthenticated",
        message: "请先登录后再保存行动选择。",
      },
      { status: 401 },
    );
  }

  if (result.status === "existing_pending_action") {
    return NextResponse.json(
      {
        status: "existing_pending_action",
        message: "你已经有一个正在尝试的行动，完成反馈后再接受新的行动。",
      },
      { status: 409 },
    );
  }

  if (result.status === "saved" || result.status === "already_saved") {
    return NextResponse.json({
      status: result.status,
      decision: result.decision,
    });
  }

  return NextResponse.json(
    {
      status: "error",
      code: "save_failed",
      message: "暂时无法保存行动选择，请稍后重试。",
    },
    { status: 500 },
  );
}
