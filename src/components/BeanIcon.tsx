export default function BeanIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2.5c5.5 0 9.5 4.2 9.5 9.5s-4 9.5-9.5 9.5S2.5 17.3 2.5 12 6.5 2.5 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M15.5 6.5c-3 1-6 4-6 7.5 0 1.6.6 3 1.3 3.9"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
