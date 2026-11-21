import { useState } from "react";
import { Controller } from "react-hook-form";
// The "mobile" build validates against each country's mobile-number rules,
// e.g. India = 10 digits starting 6-9 (landlines/toll-free are rejected).
import PhoneInput, {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input/mobile";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en";
import "react-phone-number-input/style.css";

// Country names with their dialling code, e.g. "India (+91)", so the
// dropdown shows the code you're picking.
const LABELS = {
  ...en,
  ...Object.fromEntries(getCountries().map((country) => [country, `${en[country]} (+${getCountryCallingCode(country)})`])),
};

// How many digits a mobile number has after the country code (India -> [10],
// Germany -> [10, 11]). The library doesn't expose this, so try a few sample
// numbers of each length and keep the lengths that can be valid. ~20ms, once
// per country. Empty for the few countries the samples don't cover - those
// just get no digit hint.
const lengthCache = new Map();
function getMobileLengths(country) {
  if (!lengthCache.has(country)) {
    const lengths = [];
    for (let digits = 4; digits <= 15; digits += 1) {
      search: for (let prefix = 10; prefix <= 99; prefix += 1) {
        for (const filler of ["0", "1", "5"]) {
          if (isValidPhoneNumber(`${prefix}${filler.repeat(digits - 2)}`, country)) {
            lengths.push(digits);
            break search;
          }
        }
      }
    }
    lengthCache.set(country, lengths);
  }
  return lengthCache.get(country);
}

function describeLengths(lengths) {
  if (lengths.length === 0) return "";
  const min = lengths[0];
  const max = lengths[lengths.length - 1];
  return min === max ? `${min} digits` : `${min}-${max} digits`;
}

// Country part of a stored E.164 value ("+919876543210" -> "IN").
function countryOf(value) {
  try {
    return value ? parsePhoneNumber(value)?.country : undefined;
  } catch {
    return undefined;
  }
}

// Phone input with a country-code dropdown (react-phone-number-input), wired
// to React Hook Form - pass `control` instead of a `registration`. Looks like
// FormField (label, border, indigo focus ring, dark mode). The form value is
// E.164 ("+919876543210"), or "" when empty. The hint and error spell out how
// many digits the chosen country expects; the schema (utils/phone.js) does
// the actual check.
export default function PhoneField({ id, label, name, control, error, autoComplete = "tel", defaultCountry = "IN" }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, onChange, onBlur } }) => (
        <PhoneFieldInput
          id={id}
          label={label}
          name={name}
          inputRef={ref}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          autoComplete={autoComplete}
          defaultCountry={defaultCountry}
        />
      )}
    />
  );
}

function PhoneFieldInput({ id, label, name, inputRef, value, onChange, onBlur, error, autoComplete, defaultCountry }) {
  const [country, setCountry] = useState(() => countryOf(value) ?? defaultCountry);

  const countryLabel = country ? LABELS[country] : "the selected country";
  const lengths = country ? getMobileLengths(country) : [];
  const lengthText = describeLengths(lengths);

  // The schema only knows "invalid"; say why, in terms of the chosen country.
  let message = error;
  if (error && value && country) {
    const nationalDigits = value.replace(/\D/g, "").length - getCountryCallingCode(country).length;
    message =
      lengthText && !lengths.includes(nationalDigits)
        ? `${countryLabel} numbers must be ${lengthText}.`
        : `Enter a valid ${countryLabel} mobile number.`;
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-(--text-muted)">
        {label}
      </label>
      <PhoneInput
        id={id}
        ref={inputRef}
        name={name}
        value={value || undefined}
        onChange={(next) => onChange(next ?? "")}
        onBlur={onBlur}
        onCountryChange={setCountry}
        defaultCountry={defaultCountry}
        international
        countryCallingCodeEditable={false}
        limitMaxLength
        flags={flags}
        labels={LABELS}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={`phone-field w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-3.5 text-sm text-slate-900 shadow-sm transition focus-within:ring-4 dark:bg-(--surface-2) dark:text-(--text-primary) dark:shadow-none ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50 dark:border-red-500/40 dark:focus-within:border-red-400 dark:focus-within:ring-red-500/10"
            : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-indigo-50 dark:border-(--border-subtle) dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/10"
        }`}
        numberInputProps={{ className: "bg-transparent outline-none border-0 p-0 text-inherit" }}
      />
      {message ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {message}
        </p>
      ) : (
        lengthText && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-(--text-muted)">{`${countryLabel}: ${lengthText}`}</p>
        )
      )}
    </div>
  );
}
