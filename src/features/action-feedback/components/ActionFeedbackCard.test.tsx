import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DueActionFeedbackPrompt } from "../types";
import {
  ActionFeedbackCard,
  ActionFeedbackCompletionStatus,
} from "./ActionFeedbackCard";

const action: DueActionFeedbackPrompt = {
  id: "7cf411fa-213d-46a0-94ec-46629729d65e",
  observationTitle: "你最近更频繁地查看账户",
  actionTitle: "先记录触发原因",
  actionInstruction: "下次想查看账户时，先写下是什么触发了这个念头。",
  feedbackDueAt: "2026-07-23T07:00:00.000Z",
};

describe("ActionFeedbackCard", () => {
  it("shows the shared feedback question and all three choices", () => {
    const html = renderToStaticMarkup(
      <ActionFeedbackCard action={action} onFeedback={() => undefined} />,
    );

    expect(html).toContain("这个行动对你有帮助吗？");
    expect(html).toContain("有帮助");
    expect(html).toContain("没有帮助");
    expect(html).toContain("没有尝试");
    expect(html).toContain(action.actionInstruction);
  });

  it("shows a calm completion state after feedback is saved", () => {
    const html = renderToStaticMarkup(<ActionFeedbackCompletionStatus />);

    expect(html).toContain("反馈已记录，谢谢你的回应。");
  });
});
