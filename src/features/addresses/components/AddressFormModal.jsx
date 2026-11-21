import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Hash,
  Loader2,
  Map as MapIcon,
  MapPin,
  MapPinned,
  Star,
  X,
} from "lucide-react";
import { FormField } from "@/components/common/form/index.js";
import {
  EMPTY_ADDRESS_VALUES,
  formatFullAddress,
  getAddressTypeMeta,
  isSingleAddressType,
  toAddress,
  toAddressFormValues,
  toAddressPayload,
} from "../definitions/addresses.js";
import { addressValidationSchema } from "../definitions/addressValidation.js";
import { saveAddress } from "../store/addressSlice.js";
import { useAddresses } from "../hooks/useAddresses.js";
import AddressTypeSelect from "./AddressTypeSelect.jsx";

// Add / edit a saved address. Used by the profile page and the booking
// flow's address step. `address` = the one being edited (null to add);
// `initialType` pre-picks the type when adding (e.g. "Add home address").
// Saves through the address API (POST / PATCH /user/addresses), then calls
// onSaved(savedAddress). On an API error (toasted by httpClient) the modal
// stays open with what was typed.
export default function AddressFormModal({
  open,
  address = null,
  initialType = "",
  onClose,
  onSaved,
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="address-modal"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-60 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <AddressFormDialog
            address={address}
            initialType={initialType}
            onClose={onClose}
            onSaved={onSaved}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// Mounted fresh every time the modal opens, so the form starts clean.
function AddressFormDialog({ address, initialType, onClose, onSaved }) {
  const dispatch = useDispatch();
  const { items } = useAddresses();
  const isEditing = Boolean(address);
  const isFirstAddress = items.length === 0;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressValidationSchema),
    defaultValues: address
      ? toAddressFormValues(address)
      : {
          ...EMPTY_ADDRESS_VALUES,
          label: initialType,
          isDefault: isFirstAddress,
        },
  });
  const values = useWatch({ control });

  // Escape closes; the page behind doesn't scroll while open.
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const savedTypes = items.map((item) => item.label);
  // Only one Home is allowed (the backend rejects a second one), so saving
  // is blocked while another address already is the Home.
  const taken = isSingleAddressType(values.label)
    ? (items.find(
        (item) => item.label === values.label && item.id !== address?.id,
      ) ?? null)
    : null;
  const meta = values.label ? getAddressTypeMeta(values.label) : null;
  const isWork = values.label === "Work";
  const wasDefault = Boolean(address?.isDefault);
  const preview = formatFullAddress(
    toAddress({
      addressType: values.label,
      companyName: values.companyName,
      road: values.road,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
    }),
  );

  const save = handleSubmit(async (formValues) => {
    if (taken) return;
    const payload = toAddressPayload({
      ...formValues,
      // The current default can't be switched off here - pick another
      // address as default instead.
      isDefault: formValues.isDefault || wasDefault || isFirstAddress,
    });
    try {
      const response = await dispatch(saveAddress({ id: address?.id, payload })).unwrap();
      const saved = toAddress(response.data);
      toast.success(isEditing ? `${saved.label} address updated` : `${saved.label} address saved`);
      onSaved?.(saved);
      onClose();
    } catch {
      // httpClient already toasted the reason; keep the form open.
    }
  });

  // The modal is portaled, but React still bubbles its submit to any <form>
  // that renders it (the booking step) - stop it here.
  const handleFormSubmit = (event) => {
    event.stopPropagation();
    save(event);
  };

  let title = "Add a new address";
  if (isEditing) title = `Edit ${address.label.toLowerCase()} address`;
  else if (initialType) title = `Add your ${initialType.toLowerCase()} address`;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      onClick={(event) => event.stopPropagation()}
      className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-900/20 sm:rounded-3xl dark:bg-(--surface-1) dark:shadow-black/50"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7 dark:border-(--border-subtle)">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-fuchsia-400/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-20 h-32 w-32 rounded-full bg-indigo-400/15 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <motion.span
            key={values.label || "none"}
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg shadow-indigo-600/30 ${
              meta?.gradient ?? "from-indigo-600 to-fuchsia-600"
            }`}
          >
            {meta ? (
              <meta.icon className="h-6 w-6" />
            ) : (
              <MapPinned className="h-6 w-6" />
            )}
          </motion.span>
          <div className="min-w-0 flex-1">
            <h2
              id="address-modal-title"
              className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary)"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
              Your professional uses this to reach your doorstep.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-(--surface-2)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form
        id="address-form"
        noValidate
        onSubmit={handleFormSubmit}
        className="flex-1 overflow-y-auto px-5 py-6 sm:px-7"
      >
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <AddressTypeSelect
              id="address-type"
              value={field.value}
              onChange={field.onChange}
              error={errors.label?.message}
              savedTypes={savedTypes}
              editingType={address?.label}
            />
          )}
        />

        <AnimatePresence initial={false}>
          {taken && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                You already have a {taken.label.toLowerCase()} address ({taken.houseNo}). Edit that one, or choose
                Work or Other for this address.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {isWork && (
              <motion.div
                key="company"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden sm:col-span-2"
              >
                <FormField
                  id="address-company"
                  label="Company name (optional)"
                  icon={<Briefcase className="h-4 w-4" />}
                  placeholder="ABC Pvt. Ltd."
                  autoComplete="organization"
                  error={errors.companyName?.message}
                  registration={register("companyName")}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="sm:col-span-2">
            <FormField
              id="address-road"
              label="Flat / house no., building & street"
              icon={<MapPin className="h-4 w-4" />}
              placeholder="Flat 2A, Green Residency, 22 Park Street"
              autoComplete="street-address"
              error={errors.road?.message}
              registration={register("road")}
            />
          </div>
          <FormField
            id="address-city"
            label="City"
            icon={<Building2 className="h-4 w-4" />}
            placeholder="Kolkata"
            autoComplete="address-level2"
            error={errors.city?.message}
            registration={register("city")}
          />
          <FormField
            id="address-state"
            label="State"
            icon={<MapIcon className="h-4 w-4" />}
            placeholder="West Bengal"
            autoComplete="address-level1"
            error={errors.state?.message}
            registration={register("state")}
          />
          <FormField
            id="address-pincode"
            label="Pincode"
            icon={<Hash className="h-4 w-4" />}
            placeholder="700016"
            autoComplete="postal-code"
            error={errors.pincode?.message}
            registration={register("pincode")}
          />
        </div>

        {/* Default toggle */}
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => {
            const locked = wasDefault || isFirstAddress;
            const checked = field.value || locked;
            return (
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={locked}
                onClick={() => field.onChange(!field.value)}
                className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 disabled:cursor-default disabled:hover:border-slate-200 dark:border-(--border-subtle) dark:hover:border-indigo-500/50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Star className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                    Use as my default address
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-(--text-muted)">
                    {locked
                      ? isFirstAddress
                        ? "Your first address becomes your default."
                        : "This is already your default address."
                      : "We'll pick it automatically when you book."}
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    checked
                      ? "bg-linear-to-r from-indigo-600 to-fuchsia-600"
                      : "bg-slate-200 dark:bg-(--surface-2)"
                  } ${locked ? "opacity-70" : ""}`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow ${checked ? "right-1" : "left-1"}`}
                  />
                </span>
              </button>
            );
          }}
        />

        {/* Live preview */}
        <AnimatePresence initial={false}>
          {preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-5 rounded-2xl border border-dashed border-indigo-200 bg-linear-to-br from-indigo-50/70 to-fuchsia-50/50 p-4 dark:border-indigo-500/25 dark:from-indigo-500/10 dark:to-fuchsia-500/5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Your professional will see
                </p>
                <div className="mt-2 flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                      {values.label || "Address"}
                    </p>
                    <p className="mt-0.5 wrap-break-word text-xs leading-relaxed text-slate-600 dark:text-(--text-muted)">
                      {preview}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7 dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          form="address-form"
          disabled={isSubmitting || Boolean(taken)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Save address"}
        </motion.button>
      </div>
    </motion.div>
  );
}
