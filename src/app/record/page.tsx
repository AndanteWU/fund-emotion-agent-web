import AuthUserBar from "@/features/auth/components/AuthUserBar";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { getCurrentUser } from "@/features/auth/services/server-auth-service";
import EmotionRecordForm from "@/features/emotion/components/EmotionRecordForm";

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">情绪记录</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          此刻，你的投资感受如何？
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          花一分钟记录情绪和行为，帮助自己看见反复出现的模式。
        </p>
      </header>

      {user ? (
        <>
          <AuthUserBar email={user.email ?? "邮箱信息不可用"} />
          <EmotionRecordForm />
        </>
      ) : (
        <LoginPrompt />
      )}
    </main>
  );
}