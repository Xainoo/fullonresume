export default function Spinner({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg";
}) {
  // Modern SVG spinner that's theme-aware and crisp on all sizes
  const dim = size === "lg" ? 28 : size === "md" ? 20 : 14;
  const stroke = size === "lg" ? 3 : size === "md" ? 2.5 : 2;
  return (
    <div className="d-inline-flex align-items-center" aria-hidden>
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth={stroke}
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}
