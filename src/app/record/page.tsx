import EmotionSelector from "@/components/emotion/EmotionSelector";

export default function RecordPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold">
        投资情绪记录
      </h1>

      <p className="mt-2 text-muted-foreground">
        记录今天投资过程中的情绪变化
      </p>


      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          今天的主要情绪
        </h2>

        <EmotionSelector />
      </section>

    </main>
  );
}