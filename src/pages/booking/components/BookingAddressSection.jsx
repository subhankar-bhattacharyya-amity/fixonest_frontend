import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarDays, Check, MapPinned, Pencil, Plus, User } from "lucide-react";
import { FormField, PhoneField, TextareaField } from "@/components/common/form/index.js";
import {
  AddressFormModal,
  formatAddressLine,
  getAddressTypeMeta,
} from "@/features/addresses/index.js";
import { INSTRUCTION_SUGGESTIONS, MAX_INSTRUCTIONS_LENGTH } from "../definitions/bookingAddress.data.js";
import { formatDayLong, formatSlotRange } from "../definitions/bookingSchedule.data.js";

// Step 2 of the booking flow: where to come, who to contact and any notes
// for the professional. The form itself lives in BookingFlow.jsx. Saved
// addresses come from the addresses feature; adding or editing one opens
// the shared AddressFormModal.
export default function BookingAddressSection({
  bookable,
  form,
  addresses,
  selectedDay,
  selectedSlot,
  onAddressSaved,
  onEditSchedule,
  onBack,
  onSubmit,
}) {
  const { register, control, setValue, formState, values } = form;
  const { errors } = formState;
  const [modal, setModal] = useState({ open: false, address: null });

  const instructions = values.instructions ?? "";

  const addSuggestion = (text) => {
    if (instructions.includes(text)) return;
    const next = instructions.trim() ? `${instructions.trim()}. ${text}` : text;
    setValue("instructions", next.slice(0, MAX_INSTRUCTIONS_LENGTH), {
      shouldDirty: true,
      shouldValidate: formState.isSubmitted,
    });
  };

  const openAdd = () => setModal({ open: true, address: null });
  const openEdit = (address) => setModal({ open: true, address });
  const closeModal = () => setModal((current) => ({ ...current, open: false }));

  return (
    <motion.form
      noValidate
      onSubmit={onSubmit}
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20"
    >
      <div className="p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 2</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary)">
          Where should we come?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
          {bookable.perHour
            ? `${bookable.shortName} will come to this address.`
            : "Your professional will come to this address."}
        </p>

        {selectedDay && selectedSlot && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-(--surface-2)/60">
            <span className="flex items-center gap-2.5 text-sm">
              <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-900 dark:text-(--text-primary)">{formatDayLong(selectedDay.date)}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 dark:text-(--text-muted)">{formatSlotRange(selectedSlot)}</span>
            </span>
            <button
              type="button"
              onClick={onEditSchedule}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400"
            >
              <Pencil className="h-3.5 w-3.5" />
              Change
            </button>
          </div>
        )}

        {/* Saved addresses */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">Saved addresses</h3>

          {addresses.length === 0 ? (
            <NoAddressYet onAdd={openAdd} />
          ) : (
            <div role="radiogroup" aria-label="Address" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={address.id === values.addressId}
                  onSelect={() => setValue("addressId", address.id, { shouldValidate: formState.isSubmitted })}
                  onEdit={() => openEdit(address)}
                />
              ))}

              <button
                type="button"
                onClick={openAdd}
                className="group flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5 dark:hover:text-indigo-400"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition group-hover:scale-110 group-hover:bg-indigo-100 dark:bg-(--surface-2) dark:group-hover:bg-indigo-500/20">
                  <Plus className="h-5 w-5" />
                </span>
                Add new address
              </button>
            </div>
          )}

          <AddressFormModal open={modal.open} address={modal.address} onClose={closeModal} onSaved={onAddressSaved} />

          <AnimatePresence>
            {errors.addressId && (
              <motion.p
                role="alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                <AlertCircle className="h-4 w-4" />
                {errors.addressId.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Contact person */}
        <div className="mt-8 border-t border-slate-100 pt-8 dark:border-(--border-subtle)">
          <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">Contact at the address</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
            The professional calls this number when they're on the way.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="booking-contact-name"
              label="Full name"
              icon={<User className="h-4 w-4" />}
              placeholder="Your name"
              autoComplete="name"
              error={errors.contactName?.message}
              registration={register("contactName")}
            />
            <PhoneField
              id="booking-contact-phone"
              label="Phone number"
              name="contactPhone"
              control={control}
              error={errors.contactPhone?.message}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 border-t border-slate-100 pt-8 dark:border-(--border-subtle)">
          <TextareaField
            id="booking-instructions"
            label="Anything we should know? (optional)"
            rows={3}
            placeholder="Describe the problem or share directions, e.g. the kitchen tap has been leaking since yesterday."
            error={errors.instructions?.message}
            registration={register("instructions")}
          />
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {INSTRUCTION_SUGGESTIONS.map((text) => {
                const isUsed = instructions.includes(text);
                return (
                  <button
                    key={text}
                    type="button"
                    onClick={() => addSuggestion(text)}
                    disabled={isUsed}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isUsed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:text-indigo-400"
                    }`}
                  >
                    {isUsed ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {text}
                  </button>
                );
              })}
            </div>
            <span
              className={`shrink-0 text-xs ${
                instructions.length > MAX_INSTRUCTIONS_LENGTH ? "text-rose-600" : "text-slate-400 dark:text-(--text-muted)"
              }`}
            >
              {instructions.length}/{MAX_INSTRUCTIONS_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
        >
          Continue to review
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.form>
  );
}

// No saved address yet: a friendly prompt to add the first one.
function NoAddressYet({ onAdd }) {
  return (
    <motion.button
      type="button"
      onClick={onAdd}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative mt-3 flex w-full flex-col items-center overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-linear-to-br from-indigo-50/70 to-fuchsia-50/50 px-6 py-8 text-center transition hover:border-indigo-400 dark:border-indigo-500/25 dark:from-indigo-500/10 dark:to-fuchsia-500/5 dark:hover:border-indigo-400/60"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30 transition group-hover:-translate-y-0.5 group-hover:scale-105">
        <MapPinned className="h-6 w-6" />
      </span>
      <span className="mt-4 text-base font-bold text-slate-900 dark:text-(--text-primary)">Add your address</span>
      <span className="mt-1 max-w-sm text-sm text-slate-500 dark:text-(--text-muted)">
        Save your home or work address once - we'll remember it for every booking.
      </span>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition group-hover:brightness-110">
        <Plus className="h-4 w-4" />
        Add address
      </span>
    </motion.button>
  );
}

function AddressCard({ address, isSelected, onSelect, onEdit }) {
  const Icon = getAddressTypeMeta(address.label).icon;
  return (
    <div className="group relative">
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={onSelect}
        className={`relative flex h-full min-h-32 w-full items-start gap-3 rounded-2xl border p-4 pb-10 text-left transition ${
          isSelected
            ? "border-transparent"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-md dark:border-(--border-subtle) dark:hover:border-indigo-500/50"
        }`}
      >
        {isSelected && (
          <motion.span
            layoutId="booking-address-highlight"
            className="absolute inset-0 rounded-2xl bg-indigo-50/70 ring-2 ring-indigo-500 dark:bg-indigo-500/10 dark:ring-indigo-400"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <span
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            isSelected
              ? "bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-600/30"
              : "bg-slate-100 text-slate-500 dark:bg-(--surface-2) dark:text-(--text-muted)"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-(--text-primary)">{address.label}</span>
            {address.isDefault && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                Default
              </span>
            )}
          </span>
          <span className="mt-1 block text-sm font-medium text-slate-700 dark:text-(--text-primary)">{address.houseNo}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-(--text-muted)">
            {formatAddressLine(address)}
            {address.landmark ? ` · ${address.landmark}` : ""}
          </span>
        </span>
        <span
          className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            isSelected ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400" : "border-slate-300 dark:border-(--border-subtle)"
          }`}
        >
          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${address.label.toLowerCase()} address`}
        className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-white hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-(--surface-2)"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    </div>
  );
}
