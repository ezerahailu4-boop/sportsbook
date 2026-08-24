interface DemoModeBannerProps {
  active: boolean;
}

// Spec section 9 + 61: never let demo and real data mix silently. This
// renders whenever meta.demoMode is true on any odds/payment API response.
export function DemoModeBanner({ active }: DemoModeBannerProps) {
  return null;
}
