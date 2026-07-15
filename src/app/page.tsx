import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const productEntries = [
  {
    title: "记录此刻",
    description: "用一分钟记下情绪强度、焦虑、FOMO 与操作冲动。",
    href: "/record",
    action: "开始记录",
    badge: "每日记录",
  },
  {
    title: "回看历史",
    description: "按日期和主要情绪筛选，回看当时的感受与行为。",
    href: "/history",
    action: "查看历史",
    badge: "最近 30 天",
  },
  {
    title: "情绪复盘",
    description: "通过基础统计、趋势图和 AI 复盘观察重复出现的模式。",
    href: "/insight",
    action: "进入复盘",
    badge: "行为观察",
  },
] as const;

export default function Home() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="投资情绪管理"
        title="看见情绪，再做决定"
        description="记录投资过程中的真实感受，回看行为轨迹，建立更稳定的自我观察。这里不预测市场，也不提供买卖建议。"
        actions={
          <Link href="/record" className={buttonVariants({ size: "lg" })}>
            记录此刻
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3" aria-label="主要功能">
        {productEntries.map((entry, index) => (
          <Card key={entry.href} className="flex min-h-56 flex-col">
            <CardHeader className="space-y-4">
              <Badge className="w-fit">{entry.badge}</Badge>
              <CardTitle className="text-xl">{entry.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <p className="text-sm leading-6 text-muted-foreground">
                {entry.description}
              </p>
              <Link
                href={entry.href}
                className={buttonVariants({
                  variant: index === 0 ? "default" : "secondary",
                  className: "w-full",
                })}
              >
                {entry.action}
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border bg-card px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">保持克制的观察</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              所有内容只用于情绪与行为复盘，不构成任何投资建议。
            </p>
          </div>
          <Badge className="w-fit bg-background">非投资建议</Badge>
        </div>
      </section>
    </PageContainer>
  );
}