import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function CafeIcon({ size = 24, children, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}

// Original rounded food-service pictograms, not third-party brand assets.
export function DiningIcon(props: IconProps) {
  return <CafeIcon {...props}><path d="M4 3v5c0 2 4 2 4 0V3M6 3v18M18 21V3c-3 1-5 4-5 8h5" /></CafeIcon>;
}
export function KitchenIcon(props: IconProps) {
  return <CafeIcon {...props}><path d="M7 15a4 4 0 0 1-2-7 4 4 0 0 1 7-4 4 4 0 0 1 7 4 4 4 0 0 1-2 7v6H7zM7 17h10M10 12v2M14 12v2" /></CafeIcon>;
}
export function TablesIcon(props: IconProps) {
  return <CafeIcon {...props}><rect x="5" y="6" width="14" height="12" rx="3"/><path d="M9 3h6M9 21h6M2 9v6M22 9v6" /></CafeIcon>;
}
export function BagIcon(props: IconProps) {
  return <CafeIcon {...props}><path d="M5 8h14l1 13H4zM8 8V6a4 4 0 0 1 8 0v2M9 13c1 2 5 2 6 0" /></CafeIcon>;
}
export function CupIcon(props: IconProps) {
  return <CafeIcon {...props}><path d="M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a3 3 0 0 1 0 6h-2M7 3v2M11 2v3M15 3v2" /></CafeIcon>;
}