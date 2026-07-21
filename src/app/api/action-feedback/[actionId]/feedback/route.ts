import { NextResponse } from "next/server";
import {
  actionFeedbackParamsSchema,
  actionFeedbackRequestSchema,
} from "@/features/action-feedback/schemas";
import { submitActionFeedback } from "@/features/action-feedback/services/due-action-feedback-service";

interface RouteContext {
  params: Promise<{ actionId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        code: "invalid_request",
        message: "反馈内容无效，请刷新后重试。",
      },
      { status: 400 },
    );
  }

  const params = actionFeedbackParamsSchema.safeParse(await context.params);
  const body = actionFeedbackRequestSchema.safeParse(input);
  if (!params.success || !body.success) {
    return NextResponse.json(
      {
        status: "error",
        code: "invalid_request",
        message: "反馈内容无效，请刷新后重试。",
      },
      { status: 400 },
    );
  }

  const result = await submitActionFeedback(
    params.data.actionId,
    body.data.feedback,
  );

  if (result.status === "unauthenticated") {
    return NextResponse.json(
      {
        status: "error",
        code: "unauthenticated",
        message: "请先登录后再提交行动反馈。",
      },
      { status: 401 },
    );
  }

  if (
    result.status === "completed" ||
    result.status === "already_completed"
  ) {
    return NextResponse.json(result);
  }

  if (result.status === "unavailable") {
    return NextResponse.json(
      {
        status: "unavailable",
        message: "这条行动暂时无法提交反馈，可能已经完成。",
      },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      status: "error",
      code: "save_failed",
      message: "暂时无法保存反馈，请稍后再试。",
    },
    { status: 500 },
  );
}
