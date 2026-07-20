import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BehavioralObservationQueryResult } from "../types";
import BehavioralObservationDetails from "./BehavioralObservationDetails";

interface LatestObservationCardProps {
  result: BehavioralObservationQueryResult;
}

export default function LatestObservationCard({
  result,
}: LatestObservationCardProps) {
  return (
    <section aria-labelledby="latest-observation-title">
      <Card className="border-foreground/10 bg-[linear-gradient(145deg,var(--card),color-mix(in_srgb,var(--muted)_55%,var(--card)))] shadow-[0_2px_4px_rgb(42_38_30_/_4%),0_18px_48px_rgb(42_38_30_/_8%)]">
        <CardHeader className="gap-2 px-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            主动观察
          </p>
          <CardTitle
            id="latest-observation-title"
            className="text-3xl tracking-[-0.035em]"
          >
            最新观察
          </CardTitle>
          <CardDescription>
            仅依据你最近的情绪记录进行确定性分析。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-5 px-6 sm:px-8">
          {result.status === "detected" && (
            <BehavioralObservationDetails pattern={result.pattern} />
          )}

          {result.status === "insufficient" && (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              还需要更多记录，才能识别有意义的行为模式。
            </p>
          )}

          {result.status === "none" && (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              暂未发现有意义的行为模式。
            </p>
          )}

          {result.status === "unauthenticated" && (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              登录并开始记录后，这里会展示行为观察。
            </p>
          )}

          {result.status === "error" && (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              暂时无法加载最新观察，请稍后再试。
            </p>
          )}

          <div>
            <Link
              href={result.status === "unauthenticated" ? "/login" : "/history"}
              className={buttonVariants({ variant: "outline" })}
            >
              {result.status === "unauthenticated"
                ? "前往登录"
                : "查看历史"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
