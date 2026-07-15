import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { getCurrentUser } from "@/features/auth/services/server-auth-service";
import EmotionRecordForm from "@/features/emotion/components/EmotionRecordForm";

export const dynamic = "force-dynamic";

export default async function RecordPage() {
  const user = await getCurrentUser();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="情绪记录"
        title="此刻，你的投资感受如何？"
        description="花一分钟记录情绪和行为，帮助自己看见反复出现的模式。"
      />

      <div className="max-w-3xl">
        {user ? <EmotionRecordForm /> : <LoginPrompt />}
      </div>
    </PageContainer>
  );
}