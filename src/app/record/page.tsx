import EmotionRecordForm from "@/features/emotion/components/EmotionRecordForm";

export default function RecordPage() {
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

      <EmotionRecordForm />
    </main>
  );
}