import React, { useState, useRef, useEffect } from "react";

type Props = {
  title?: string;
  children: React.ReactNode; // the help text/content
  id?: string;
};

export default function InfoIcon({ title = "Info", children, id }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="info-icon" ref={ref} aria-live="polite">
      <button
        aria-label={title}
        aria-expanded={open}
        aria-controls={id}
        className="info-icon__button"
        onClick={() => setOpen((s) => !s)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className="visually-hidden">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
          <path
            d="M7.25 5.5h1.5v1.5h-1.5V5.5zM7.25 8.5h1.5v4h-1.5v-4z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div
        id={id}
        role="tooltip"
        className={`info-icon__tooltip ${
          open ? "info-icon__tooltip--open" : ""
        }`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="info-icon__content">{children}</div>
      </div>
    </div>
  );
}
