import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { TextareaField } from "@/components/common/form/index.js";
import { blogCommentValidationSchema } from "../definitions/blogCommentValidation.js";

// "Write a Comment" card under the comment list. Only shown to a logged-in
// customer, who is the author - so there is no name/email to fill in.
// `onSubmit(content)` posts it (BlogCommentsSection dispatches the thunk);
// the form clears once that succeeds and keeps the text if it fails.
export default function BlogCommentForm({ authorName, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogCommentValidationSchema),
    defaultValues: { message: "", agreeToTerms: false },
  });

  const submit = async (values) => {
    const posted = await onSubmit(values.message);
    if (posted) reset();
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20 sm:p-8">
      <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">Write a Comment</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
        {authorName ? (
          <>
            Commenting as <span className="font-semibold text-slate-700 dark:text-(--text-primary)">{authorName}</span>
          </>
        ) : (
          "Share your thoughts."
        )}
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
        <TextareaField
          id="message"
          label="Comment"
          placeholder="Write your comment…"
          error={errors.message?.message}
          registration={register("message")}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-(--border-subtle)"
              {...register("agreeToTerms")}
            />
            I agree with all the terms &amp; conditions
          </label>
          {errors.agreeToTerms ? (
            <p className="mt-1.5 text-xs text-rose-500">{errors.agreeToTerms.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSubmitting ? "Posting…" : "Post Comment"}
          {!isSubmitting && <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
