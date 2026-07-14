import EmotionRecordForm from "@/features/emotion/components/EmotionRecordForm";

export default function RecordPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">
        投资情绪记录
      </h1>

      <p className="mt-2 text-muted-foreground">
        记录今天投资过程中的情绪变化
      </p>

      <EmotionRecordForm />
    </main>
  );
}