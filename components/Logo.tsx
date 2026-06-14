export function Logo({ className = "", variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const stroke = variant === "light" ? "white" : "#1d4ed8";
  const text = variant === "light" ? "white" : "#1e293b";
  const dot = variant === "light" ? "#93c5fd" : "#3b82f6";
  const bar1 = variant === "light" ? "white" : "#1d4ed8";
  const bar2 = variant === "light" ? "#93c5fd" : "#93c5fd";

  return (
    <svg
      width="148"
      height="34"
      viewBox="0 0 148 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cartin"
    >
      {/* hanger hook */}
      <path
        d="M28 7 Q28 2 33 2 Q38 2 38 7"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* hanger body triangle */}
      <path
        d="M28 7 L10 31 L56 31 Z"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* crossbar */}
      <line
        x1="10" y1="31" x2="56" y2="31"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* accent dot */}
      <circle cx="51" cy="11" r="5" fill={dot} />

      {/* wordmark */}
      <text
        x="64"
        y="23"
        fontFamily="'Kanit', sans-serif"
        fontWeight="700"
        fontSize="18"
        fill={text}
        letterSpacing="2"
      >
        CARTIN
      </text>

      {/* underline accent bars */}
      <rect x="64" y="28" width="10" height="2.5" rx="1.25" fill={bar1} />
      <rect x="77" y="28" width="38" height="2.5" rx="1.25" fill={bar2} />
    </svg>
  );
}
