import EmotionHistoryPage, {
  type EmotionHistorySearchParams,
} from "@/features/emotion/components/EmotionHistoryPage";

export const dynamic = "force-dynamic";

interface HistoryPageProps {
  searchParams: Promise<EmotionHistorySearchParams>;
}

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  return <EmotionHistoryPage searchParams={await searchParams} />;
}
