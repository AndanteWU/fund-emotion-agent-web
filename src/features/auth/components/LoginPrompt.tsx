import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPrompt() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>登录后记录</CardTitle>
        <CardDescription className="leading-6">
          登录用于安全保存你的情绪记录，并确保记录只关联到你自己的账户。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          前往登录
        </Link>
      </CardContent>
    </Card>
  );
}
