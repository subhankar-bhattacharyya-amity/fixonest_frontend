import { useEffect, useRef } from "react";
import { motion, useAnimate } from "framer-motion";

// Segmented one-time-code input. `value` is a string of `length` characters
// where an empty box is a space, so clearing a middle digit never shifts the
// others. Handles typing, backspace, arrow keys, pasting a whole code into
// any box, and the phone keyboard's "one-time-code" autofill.
// status: "idle" | "error" | "success" — drives the box colors.
// shakeKey: bump it to replay the error shake.
const EMPTY = " ";

const BOX_STYLES = {
  idle: {
    empty:
      "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-100 dark:border-(--border-subtle) dark:bg-(--surface-2) dark:text-(--text-primary) dark:focus:border-indigo-400 dark:focus:ring-indigo-500/15",
    filled:
      "border-indigo-300 bg-indigo-50/70 text-indigo-700 focus:border-indigo-500 focus:ring-indigo-100 dark:border-indigo-400/50 dark:bg-indigo-500/10 dark:text-indigo-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/15",
  },
  error: {
    empty:
      "border-red-300 bg-red-50/60 text-red-700 focus:border-red-400 focus:ring-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 dark:focus:ring-red-500/10",
    filled:
      "border-red-300 bg-red-50/60 text-red-700 focus:border-red-400 focus:ring-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 dark:focus:ring-red-500/10",
  },
  success: {
    empty: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-300",
    filled: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
};

export default function OtpInput({
  length = 4,
  value = "",
  onChange,
  onComplete,
  status = "idle",
  shakeKey = 0,
  disabled = false,
  autoFocus = false,
  ariaDescribedBy,
}) {
  const inputsRef = useRef([]);
  const [rowRef, animateRow] = useAnimate();
  const digits = Array.from({ length }, (_, i) => (value[i] && value[i] !== EMPTY ? value[i] : ""));

  const focusBox = (index) => {
    const target = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
    if (target) {
      target.focus();
      target.select();
    }
  };

  useEffect(() => {
    if (autoFocus) focusBox(0);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a wrong code: shake the row and put the cursor back at the start
  // (the page clears the boxes).
  useEffect(() => {
    if (shakeKey === 0 || !rowRef.current) return;
    animateRow(rowRef.current, { x: [0, -12, 12, -9, 9, -5, 5, 0] }, { duration: 0.5, ease: "easeInOut" });
    focusBox(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeKey]);

  const commit = (nextDigits) => {
    const nextValue = nextDigits.map((digit) => digit || EMPTY).join("");
    onChange?.(nextValue);
    if (nextDigits.every(Boolean)) onComplete?.(nextDigits.join(""));
  };

  const fillFrom = (startIndex, text) => {
    const incoming = text.replace(/\D/g, "").slice(0, length);
    if (!incoming) return;
    // A full-length code always lands from the first box, wherever it was pasted.
    const start = incoming.length === length ? 0 : startIndex;
    const next = [...digits];
    incoming.split("").forEach((digit, offset) => {
      if (start + offset < length) next[start + offset] = digit;
    });
    commit(next);
    const firstEmpty = next.findIndex((digit) => !digit);
    focusBox(firstEmpty === -1 ? length - 1 : firstEmpty);
  };

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) return;

    // Several digits at once = phone autofill or a paste the browser routed
    // through onChange; one extra digit = typing over an existing digit.
    if (raw.length > 2) {
      fillFrom(index, raw);
      return;
    }

    const next = [...digits];
    next[index] = raw[raw.length - 1];
    commit(next);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusBox(index - 1);
      }
    } else if (event.key === "Delete") {
      event.preventDefault();
      const next = [...digits];
      next[index] = "";
      commit(next);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusBox(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusBox(length - 1);
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  const palette = BOX_STYLES[status] ?? BOX_STYLES.idle;

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label={`${length}-digit verification code`}
      className="mx-auto grid max-w-76 gap-3 sm:gap-4"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, scale: status === "success" ? [1, 1.12, 1] : 1 }}
          transition={{
            opacity: { delay: 0.08 * index, duration: 0.35 },
            y: { delay: 0.08 * index, duration: 0.35 },
            scale: { delay: 0.07 * index, duration: 0.4 },
          }}
        >
          <input
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={status === "error"}
            aria-describedby={ariaDescribedBy}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.target.select()}
            className={`aspect-square w-full rounded-2xl border-2 text-center text-2xl font-bold tabular-nums caret-indigo-500 shadow-sm outline-none transition duration-200 focus:-translate-y-0.5 focus:shadow-lg focus:shadow-indigo-500/15 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none sm:text-3xl ${
              digit ? palette.filled : palette.empty
            }`}
          />
          {/* Small gradient bar under a filled box — a quiet "got it" cue. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-2 left-1/2 h-1 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300 ${
              digit && status === "idle" ? "w-6 opacity-100" : "w-0 opacity-0"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
