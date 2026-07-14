import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import { getCurrentUser } from "@/features/auth/services/server-auth-service";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/record");
  }

  const params = await searchParams;
  const callbackFailed = params.error === "auth_callback";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Fund Emotion Agent
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          继续记录你的投资情绪
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          验证码将发送到你的邮箱，不需要设置密码。
        </p>
      </div>
      <LoginForm callbackFailed={callbackFailed} />
    </main>
  );
}
