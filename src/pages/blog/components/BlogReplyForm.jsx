import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { TextareaField } from "@/components/common/form/index.js";
import { blogReplyValidationSchema } from "../definitions/blogReplyValidation.js";

// Inline editor under a comment - opened by its "Reply" button, or by "Edit"
// with the current text filled in. `onSubmit(text)` returns true once the
// parent's thunk succeeded; the parent then closes the editor.
export default function BlogReplyForm({
  id,
  defaultMessage = "",
  label = "Reply",
  placeholder = "Write a reply…",
  submitLabel = "Post Reply",
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogReplyValidationSchema),
    defaultValues: { message: defaultMessage },
  });

  return (
    <form
      className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-(--border-subtle) dark:bg-(--surface-2)/40"
      onSubmit={handleSubmit((values) => onSubmit(values.message))}
      noValidate
    >
      <TextareaField
        id={id}
        label={label}
        rows={3}
        placeholder={placeholder}
        error={errors.message?.message}
        registration={register("message")}
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving…" : submitLabel}
          {!isSubmitting && <Send className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60 dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
