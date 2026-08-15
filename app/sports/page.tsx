import { SportsDirectory } from "@/components/sports/SportsDirectory";
import { Sidebar } from "@/components/shared/Sidebar";
import { BetSlip } from "@/components/betting/BetSlip";

export default function SportsOverviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        <Sidebar />

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <SportsDirectory />
        </div>

        <BetSlip />
      </div>
    </div>
  );
}
