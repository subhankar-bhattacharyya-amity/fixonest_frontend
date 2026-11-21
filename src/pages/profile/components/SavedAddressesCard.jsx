import { useState } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Landmark, Loader2, MapPinned, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  AddressFormModal,
  deleteAddress,
  formatAddressLine,
  getAddressTypeMeta,
  setDefaultAddress,
  useAddresses,
} from "@/features/addresses/index.js";
import { ConfirmDialog } from "@/components/common/confirmDialog/index.js";

// Types that always get a tile here - an "add" prompt while none is saved.
const SLOT_TYPES = ["Home", "Work"];

// "Saved addresses" on the profile page: the Home address, the Work
// address(es) - each type shows an "add" prompt while none is saved - then
// any "Other" ones. Every saved address has edit / make default / remove,
// all through the address API (POST / PATCH / DELETE /user/addresses).
// Adding and editing happen in the shared AddressFormModal.
export default function SavedAddressesCard() {
  const dispatch = useDispatch();
  const { items } = useAddresses();
  const otherAddresses = items.filter((item) => !SLOT_TYPES.includes(item.label));
  const [modal, setModal] = useState({ open: false, address: null, type: "" });
  const [removing, setRemoving] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [defaultingId, setDefaultingId] = useState(null);

  const openAdd = (type) => setModal({ open: true, address: null, type });
  const openEdit = (address) => setModal({ open: true, address, type: address.label });
  const closeModal = () => setModal((current) => ({ ...current, open: false }));

  const confirmRemove = async () => {
    setIsRemoving(true);
    try {
      await dispatch(deleteAddress(removing.id)).unwrap();
      toast.success(`${removing.label} address removed`);
      setRemoving(null);
    } catch {
      // httpClient already toasted the reason.
    } finally {
      setIsRemoving(false);
    }
  };

  const makeDefault = async (address) => {
    setDefaultingId(address.id);
    try {
      await dispatch(setDefaultAddress(address.id)).unwrap();
      toast.success(`${address.label} is now your default address`);
    } catch {
      // httpClient already toasted the reason.
    } finally {
      setDefaultingId(null);
    }
  };

  const renderTile = (address) => (
    <AddressTile
      key={address.id}
      address={address}
      isDefaulting={defaultingId === address.id}
      onEdit={() => openEdit(address)}
      onRemove={() => setRemoving(address)}
      onMakeDefault={() => makeDefault(address)}
    />
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30">
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8 sm:pb-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <MapPinned className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-(--text-primary)">Saved addresses</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
              Save your home and work so booking takes just a few taps.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)">
          {items.length} saved
        </span>
      </div>

      <div className="h-px bg-slate-100 dark:bg-(--border-subtle)" />

      <div className="grid grid-cols-1 gap-5 p-6 sm:p-8 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {SLOT_TYPES.flatMap((type) => {
            const saved = items.filter((item) => item.label === type);
            return saved.length
              ? saved.map(renderTile)
              : [<EmptyTile key={`empty-${type}`} type={type} onAdd={() => openAdd(type)} />];
          })}
          {otherAddresses.map(renderTile)}
        </AnimatePresence>

        <AddAnotherTile onAdd={() => openAdd("")} />
      </div>

      <AddressFormModal open={modal.open} address={modal.address} initialType={modal.type} onClose={closeModal} />

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.label.toLowerCase() ?? ""} address?`}
        description="You can add it again any time. Bookings you've already made keep their address."
        confirmLabel="Remove"
        loading={isRemoving}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </section>
  );
}

const tileMotion = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.2 },
};

// Faint street-map lines over the tile's gradient banner.
function MapPattern() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-white/20" preserveAspectRatio="none" viewBox="0 0 400 96">
      <path d="M-10 70 C 60 40, 120 90, 200 55 S 330 20, 410 45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M90 -10 L 130 110" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M260 -10 L 230 110" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M-10 22 L 410 12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
      <circle cx="330" cy="30" r="22" fill="currentColor" opacity="0.35" />
      <circle cx="40" cy="88" r="30" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function AddressTile({ address, isDefaulting, onEdit, onRemove, onMakeDefault }) {
  const meta = getAddressTypeMeta(address.label);
  const Icon = meta.icon;
  return (
    <motion.article
      {...tileMotion}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:hover:shadow-black/30"
    >
      <div className={`relative h-20 bg-linear-to-br ${meta.gradient}`}>
        <MapPattern />
        {address.isDefault && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-white" />
            Default
          </span>
        )}
        <span className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg ring-4 ring-white transition group-hover:scale-105 dark:bg-(--surface-1) dark:text-(--text-primary) dark:ring-(--surface-1)">
          <span className={`flex h-full w-full items-center justify-center rounded-2xl ${meta.soft}`}>
            <Icon className="h-5 w-5" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-9">
        <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">{address.label}</h3>
        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-(--text-primary)">{address.houseNo}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">
          {formatAddressLine(address)}
          {address.state ? `, ${address.state}` : ""}
        </p>
        {address.landmark && (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)">
            <Landmark className="h-3.5 w-3.5" />
            {address.landmark}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {!address.isDefault && (
            <button
              type="button"
              onClick={onMakeDefault}
              disabled={isDefaulting}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)"
            >
              {isDefaulting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
              Make default
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${address.label.toLowerCase()} address`}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

// Always last in the grid: add any address, type picked in the modal.
function AddAnotherTile({ onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="group flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-(--border-subtle) dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-(--surface-2) dark:text-(--text-muted) dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-400">
        <Plus className="h-6 w-6" />
      </span>
      <span className="text-base font-bold text-slate-900 dark:text-(--text-primary)">Add new address</span>
      <span className="max-w-60 text-sm text-slate-500 dark:text-(--text-muted)">
        Family, friends or anywhere else you'd like us to come.
      </span>
    </button>
  );
}

function EmptyTile({ type, onAdd }) {
  const meta = getAddressTypeMeta(type);
  const Icon = meta.icon;
  return (
    <motion.button
      {...tileMotion}
      type="button"
      onClick={onAdd}
      className="group relative flex h-full min-h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-(--border-subtle) dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
    >
      <span className="relative">
        <span className={`absolute inset-0 rounded-2xl bg-linear-to-br ${meta.gradient} opacity-20 blur-xl transition group-hover:opacity-40`} />
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${meta.gradient} text-white shadow-lg shadow-indigo-600/25 transition group-hover:-translate-y-0.5 group-hover:scale-105`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600 shadow ring-2 ring-white dark:bg-(--surface-1) dark:text-indigo-400 dark:ring-(--surface-1)">
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </span>
      <span className="mt-5 text-base font-bold text-slate-900 dark:text-(--text-primary)">
        Add your {type.toLowerCase()} address
      </span>
      <span className="mt-1 max-w-60 text-sm text-slate-500 dark:text-(--text-muted)">
        {meta.hint}. We'll fill it in for you when you book.
      </span>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400">
        <Plus className="h-4 w-4" />
        Add {type.toLowerCase()}
      </span>
    </motion.button>
  );
}
