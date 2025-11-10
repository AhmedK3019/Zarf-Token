import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";

const TOOLTIP_DELAY = 1500;

const CopyButton = ({
  value = "",
  label = "Copy code",
  ariaLabel = "Copy code",
  tooltip = "Copy to clipboard",
  copiedTooltip = "Copied!",
  disabled = false,
  className = "",
  buttonClassName = "",
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [tooltipText, setTooltipText] = useState(tooltip);
  const timerRef = useRef(null);

  useEffect(() => {
    setTooltipText(copied ? copiedTooltip : tooltip);
  }, [copied, tooltip, copiedTooltip]);

  useEffect(() => {
    if (!copied) return undefined;
    timerRef.current = setTimeout(() => {
      setCopied(false);
    }, TOOLTIP_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (disabled || !value) return;
    try {
      const canUseNavigator =
        typeof navigator !== "undefined" &&
        navigator?.clipboard &&
        typeof navigator.clipboard.writeText === "function";
      if (canUseNavigator) {
        await navigator.clipboard.writeText(value);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      if (typeof onCopy === "function") onCopy(value);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [disabled, onCopy, value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCopy();
    }
  };

  const icon = useMemo(
    () =>
      copied ? (
        <CheckCircle2 className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
      ) : (
        <Copy
          className="h-4 w-4 text-[#9ca3af] transition duration-200 group-hover:text-[#4b5563]"
          aria-hidden="true"
        />
      ),
    [copied]
  );

  return (
    <div className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        role="button"
        aria-label={ariaLabel}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4C3BCF] disabled:cursor-not-allowed disabled:opacity-50 ${
          copied
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-[#E4E0FF] bg-white text-[#1F1B3B] hover:border-[#C9C2FF]"
        } ${buttonClassName}`}
      >
        {icon}
        <span>{copied ? "Copied" : label}</span>
      </button>
      {!disabled && (
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-lg bg-[#1F1B3B] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          {tooltipText}
        </span>
      )}
    </div>
  );
};

export default CopyButton;
