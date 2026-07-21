import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionDecisionStatus } from "./ActionDecisionControls";

describe("ActionDecisionStatus", () => {
  it("shows the accepted success state", () => {
    const html = renderToStaticMarkup(
      <ActionDecisionStatus state="accepted" />,
    );

    expect(html).toContain(
      "行动已保存。24 小时后，我们会询问它是否对你有帮助。",
    );
  });

  it("shows the declined success state", () => {
    const html = renderToStaticMarkup(
      <ActionDecisionStatus state="declined" />,
    );

    expect(html).toContain("已记录。本次不会继续提醒。");
  });
});
