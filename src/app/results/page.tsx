import { getCollectionResult } from "@/lib/mockData";
import CollectionResultsContent from "@/components/CollectionResultsContent";

interface ResultsPageProps {
  searchParams: { source?: string };
}

export const metadata = {
  title: "Your Collection Results | Scent DNA",
  description:
    "Your fragrance collection score, scent profile, strengths, and personalized recommendations.",
};

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  const initialResult = getCollectionResult();
  const fromUpload = searchParams.source === "upload";
  return <CollectionResultsContent initialResult={initialResult} fromUpload={fromUpload} />;
}
