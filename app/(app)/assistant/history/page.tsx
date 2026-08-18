import { Metadata } from "next";
import { CopyTraceabilityView } from "@/components/modules/history/copy-traceability-view";

export const metadata: Metadata = {
  title: "Copy Audit Trail & Traceability | Assistant Desk",
  description:
    "Expose complete, immutable historical lifecycles, condition notes, and chain of custody for any physical book copy by barcode.",
};

export default function AssistantHistoryPage() {
  return (
    <div className="space-y-6">
      <CopyTraceabilityView />
    </div>
  );
}
