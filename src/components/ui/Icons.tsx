// Nocturne line icons — thin strokes, quiet, inherit currentColor.
interface IconProps {
  size?: number;
}

function Svg({ size = 22, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M8.5 12.3l2.3 2.3 4.7-5.2" />
    </Svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 7v10M17 7v10M3.5 9.5v5M20.5 9.5v5M7 12h10" />
    </Svg>
  );
}

export function TrendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 17.5l5.2-5.7 3.4 3 6.4-7" />
      <path d="M14.5 7.8h4v4" />
    </Svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20.2S4.7 15.7 3.2 11C2.3 8.2 3.9 5.2 7 5.2c2 0 3.3 1.1 5 3.2 1.7-2.1 3-3.2 5-3.2 3.1 0 4.7 3 3.8 5.8-1.5 4.7-8.8 9.2-8.8 9.2z" />
    </Svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h9M17.5 7H20M4 12h3M11.5 12H20M4 17h11M19.5 17H20" />
      <circle cx="15.2" cy="7" r="2" />
      <circle cx="9.2" cy="12" r="2" />
      <circle cx="17.2" cy="17" r="2" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5.5" width="16" height="15" rx="3" />
      <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </Svg>
  );
}
