import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import FormField from "./FormField.jsx";

// Password input built on FormField, adding its own show/hide toggle state.
export default function PasswordField({ id, label, labelAction, error, autoComplete, registration }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      labelAction={labelAction}
      type={visible ? "text" : "password"}
      error={error}
      autoComplete={autoComplete}
      registration={registration}
      icon={<Lock className="h-5 w-5" />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="text-slate-400 transition hover:text-slate-600 dark:text-(--text-muted) dark:hover:text-(--text-primary)"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
    />
  );
}
