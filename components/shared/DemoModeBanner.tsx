interface DemoModeBannerProps {
  active: boolean;
}

// Spec section 9 + 61: never let demo and real data mix silently. This
// renders whenever meta.demoMode is true on any odds/payment API response.
export function DemoModeBanner({ active }: DemoModeBannerProps) {
  if (!active) return null;

  return (
    <div className="w-full bg-amber-500/15 border border-amber-500/40 text-amber-200 text-sm px-4 py-2 rounded-md flex items-center gap-2">
      <span className="font-semibold tracking-wide">DEMO MODE</span>
      <span className="opacity-80">
        Showing simulated odds and a simulated wallet. No real money or live sports data is involved.
      </span>
    </div>
  );
}
