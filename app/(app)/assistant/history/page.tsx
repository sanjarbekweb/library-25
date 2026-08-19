import { Metadata } from "next";
import { CopyTraceabilityView } from "@/components/modules/history/copy-traceability-view";
import { getCopyTraceabilityByBarcode } from "@/lib/services/history-service";

export const metadata: Metadata = {
  title: "Copy Audit Trail & Traceability | Assistant Desk",
  description:
    "Expose complete, immutable historical lifecycles, condition notes, and chain of custody for any physical book copy by barcode.",
};

interface PageProps {
  searchParams: Promise<{ barcode?: string }>;
}

export default async function AssistantHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const barcode = params.barcode || "";

  let initialDetail = null;
  if (barcode.trim()) {
    try {
      initialDetail = await getCopyTraceabilityByBarcode(barcode.trim());
    } catch {
      initialDetail = null;
    }
  }

  return (
    <div className="space-y-6">
      <CopyTraceabilityView initialBarcode={barcode} initialDetail={initialDetail} />
    </div>
  );
}
