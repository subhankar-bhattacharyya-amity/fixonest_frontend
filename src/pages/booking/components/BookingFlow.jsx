import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { formatPhoneNumberIntl } from "react-phone-number-input/mobile";
import { useAuth } from "@/features/auth/index.js";
import { useAddresses } from "@/features/addresses/index.js";
import { buildBookingDays, toDateKey } from "../definitions/bookingSchedule.data.js";
import { bookingScheduleValidationSchema } from "../definitions/bookingScheduleValidation.js";
import { toE164Phone } from "../definitions/bookingAddress.data.js";
import { bookingAddressValidationSchema } from "../definitions/bookingAddressValidation.js";
import { computeBookingPrice } from "../definitions/bookingPricing.js";
import { PAYMENT_METHODS, bookingReviewValidationSchema } from "../definitions/bookingReviewValidation.js";
import BookingHeader from "./BookingHeader.jsx";
import BookingScheduleSection from "./BookingScheduleSection.jsx";
import BookingAddressSection from "./BookingAddressSection.jsx";
import { useDispatch } from "react-redux";
import {
  createBooking,
  createWorkerBooking,
  fetchArrivalWindows,
  fetchSlotProviders,
  fetchWorkerAvailability,
  getSlotKey,
  useBookings,
} from "@/features/bookings/index.js";
import BookingReviewSection from "./BookingReviewSection.jsx";
import BookingConfirmedSection from "./BookingConfirmedSection.jsx";
import BookingSummaryCard from "./BookingSummaryCard.jsx";
import BookingProviderModal from "./BookingProviderModal.jsx";
import { fetchCategoryWorkers, useWorkers } from "@/features/workers/index.js";
import { toChosenProvider } from "../definitions/bookingProviders.js";
import { toApiTime } from "../definitions/bookingSchedule.data.js";
import {
  fromCreatedBooking,
  toCreateBookingPayload,
  toCreateWorkerBookingPayload,
} from "../definitions/bookingRequest.js";

const STEP_SCHEDULE = 0;
const STEP_ADDRESS = 1;
const STEP_REVIEW = 2;
const STEP_DONE = 3;

// HTTP 409 from POST /bookings: the slot or professional was taken meanwhile.
const CONFLICT_STATUS = 409;

// Arrival windows / a worker's start times not loaded yet (shared objects so
// memos stay stable).
const NO_WINDOWS = { byDate: {}, dayCount: 0, leadHours: 0 };
const NO_WORKER_SCHEDULE = { byDate: {}, dayCount: 0, maxHours: 0 };

const firstAvailableKey = (days) => days.find((day) => day.isAvailable)?.key ?? "";

const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// The whole booking flow, shared by the service and worker booking pages.
// `bookable` is definitions/bookable.js's shape. Each step has its own form;
// both live here so going back and forth keeps what the customer entered.
// Steps: 1 date & time, 2 address, 3 review & pay, 4 confirmed. Once
// confirmed the earlier steps are locked.
export default function BookingFlow({ bookable }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const topRef = useRef(null);
  const [step, setStep] = useState(STEP_SCHEDULE);
  const { arrivalWindows, workerAvailability, slotProviders } = useBookings();
  // Everything comes from the backend. Service bookings: the days and arrival
  // windows the super admin sets up in Settings. Worker bookings: the
  // worker's hourly start times, each with how many hours they're free from it.
  const usesArrivalWindows = !bookable.perHour;
  const workerId = bookable.worker?.id ?? null;
  const [today] = useState(() => toDateKey(new Date()));
  const hasTodaysWindows = arrivalWindows.from === today;
  const hasWorkerSchedule = workerAvailability.workerId === workerId && workerAvailability.from === today;
  let scheduleSource;
  let scheduleStatus;
  if (usesArrivalWindows) {
    scheduleSource = { arrivalWindows: hasTodaysWindows ? arrivalWindows : NO_WINDOWS };
    scheduleStatus = hasTodaysWindows ? arrivalWindows.status : "loading";
  } else {
    scheduleSource = { workerSchedule: hasWorkerSchedule ? workerAvailability : NO_WORKER_SCHEDULE };
    scheduleStatus = hasWorkerSchedule ? workerAvailability.status : "loading";
  }
  const scheduleData = scheduleSource.arrivalWindows ?? scheduleSource.workerSchedule;
  // The longest a worker can be booked for on any day (at least 1 so the
  // picker still works while it loads).
  const maxHours = Math.max(scheduleSource.workerSchedule?.maxHours ?? 1, 1);
  const [initialDate] = useState(() => firstAvailableKey(buildBookingDays(1, new Date(), scheduleSource)));
  // The customer's saved addresses (shared with the profile page).
  const { items: addresses } = useAddresses();

  const loadSchedule = () => {
    if (usesArrivalWindows) dispatch(fetchArrivalWindows({ from: today }));
    else if (workerId) dispatch(fetchWorkerAvailability({ workerId, from: today }));
  };

  useEffect(() => {
    if (usesArrivalWindows) dispatch(fetchArrivalWindows({ from: today }));
    else if (workerId) dispatch(fetchWorkerAvailability({ workerId, from: today }));
  }, [dispatch, usesArrivalWindows, workerId, today]);

  // ---- Step 1: date & time ----
  const scheduleForm = useForm({
    resolver: zodResolver(bookingScheduleValidationSchema),
    defaultValues: { date: initialDate, slot: "", hours: 1 },
  });
  const schedule = useWatch({ control: scheduleForm.control });
  const hours = bookable.perHour ? schedule.hours : 1;

  const days = useMemo(
    () => buildBookingDays(hours, new Date(), usesArrivalWindows ? { arrivalWindows: scheduleData } : { workerSchedule: scheduleData }),
    [hours, usesArrivalWindows, scheduleData],
  );

  // Once the closed days / arrival windows arrive, move off a pre-selected
  // day that turned out to be unavailable (only while nothing has been
  // picked yet).
  useEffect(() => {
    if (scheduleStatus !== "succeeded" || step !== STEP_SCHEDULE) return;
    const current = days.find((day) => day.key === scheduleForm.getValues("date"));
    if (current?.isAvailable || scheduleForm.getValues("slot")) return;
    scheduleForm.setValue("date", firstAvailableKey(days));
  }, [scheduleStatus, days, step, scheduleForm]);
  const selectedDay = days.find((day) => day.key === schedule.date) ?? null;
  const selectedSlot =
    selectedDay?.slots.find((slot) => slot.key === schedule.slot && slot.availability !== "booked") ?? null;

  const updateSchedule = (name, value) =>
    scheduleForm.setValue(name, value, { shouldDirty: true, shouldValidate: scheduleForm.formState.isSubmitted });

  // ---- Choose your professional (service bookings only) ----
  // A worker booking already names its professional. For a service, picking
  // a slot opens a modal of the service's providers who are free then (asked
  // from the booking API per slot).
  const { byCategory: categoryWorkers } = useWorkers();
  const pickProvider = bookable.kind === "service" && Boolean(bookable.serviceId);
  const [provider, setProvider] = useState(null); // null = any available professional
  const [providerModal, setProviderModal] = useState({ open: false, key: 0 });

  useEffect(() => {
    if (pickProvider && bookable.categorySlug) dispatch(fetchCategoryWorkers(bookable.categorySlug));
  }, [dispatch, pickProvider, bookable.categorySlug]);

  const slotQuery = (dateKey, slot) => ({
    serviceId: bookable.serviceId,
    date: dateKey,
    startTime: toApiTime(slot.hour),
    endTime: toApiTime(slot.endHour),
  });

  const loadSlotProviders = (dateKey, slot) => {
    if (pickProvider && dateKey && slot) dispatch(fetchSlotProviders(slotQuery(dateKey, slot)));
  };

  // Only the answer for the slot now selected counts.
  const currentSlotProviders =
    selectedDay && selectedSlot && slotProviders.key === getSlotKey(slotQuery(selectedDay.key, selectedSlot))
      ? slotProviders
      : { items: [], status: "idle", isWorkingDay: true, reason: null };

  const openProviderModal = () => {
    // Re-check who's free each time it opens - someone may have been booked.
    loadSlotProviders(selectedDay?.key, selectedSlot);
    setProviderModal((current) => ({ open: true, key: current.key + 1 }));
  };
  const closeProviderModal = () => setProviderModal((current) => ({ ...current, open: false }));

  const handleSlotChange = (slotKey) => {
    updateSchedule("slot", slotKey);
    setProvider(null);
    if (!pickProvider) return;
    loadSlotProviders(selectedDay?.key, selectedDay?.slots.find((slot) => slot.key === slotKey));
    setProviderModal((current) => ({ open: true, key: current.key + 1 }));
  };

  const handleProviderConfirm = (worker) => {
    setProvider(toChosenProvider(worker));
    closeProviderModal();
  };

  const handlePickAnotherTime = () => {
    updateSchedule("slot", "");
    setProvider(null);
    closeProviderModal();
  };

  const handleDateChange = (dateKey) => {
    updateSchedule("date", dateKey);
    updateSchedule("slot", "");
    setProvider(null);
  };

  // More hours can push the chosen start time (or every slot of the chosen
  // day) into closing time, a break or another booking - drop whatever no
  // longer fits.
  const handleHoursChange = (requestedHours) => {
    const nextHours = Math.min(Math.max(requestedHours, 1), maxHours);
    updateSchedule("hours", nextHours);
    const nextDays = buildBookingDays(nextHours, new Date(), { workerSchedule: scheduleData });
    const day = nextDays.find((item) => item.key === schedule.date);
    if (!day?.isAvailable) {
      updateSchedule("date", firstAvailableKey(nextDays));
      updateSchedule("slot", "");
      return;
    }
    const slot = day.slots.find((item) => item.key === schedule.slot);
    if (slot && slot.availability === "booked") updateSchedule("slot", "");
  };

  // ---- Step 2: address ----
  const addressForm = useForm({
    resolver: zodResolver(bookingAddressValidationSchema),
    defaultValues: {
      addressId: addresses.find((address) => address.isDefault)?.id ?? "",
      contactName: user?.fullName ?? "",
      contactPhone: toE164Phone(user),
      instructions: "",
    },
  });
  const addressValues = useWatch({ control: addressForm.control });
  const selectedAddress = addresses.find((address) => address.id === addressValues.addressId) ?? null;

  // The addresses come from /me, which may still be loading when the page
  // opens - pre-select the default once they arrive (only if nothing valid
  // is chosen yet).
  useEffect(() => {
    if (selectedAddress) return;
    const fallback = addresses.find((address) => address.isDefault) ?? addresses[0];
    if (fallback) addressForm.setValue("addressId", fallback.id);
  }, [addresses, selectedAddress, addressForm]);

  // An address added or edited in the address modal becomes the chosen one.
  const handleAddressSaved = (address) => {
    addressForm.setValue("addressId", address.id, { shouldValidate: addressForm.formState.isSubmitted });
  };

  // ---- Step 3: review & pay ----
  const pricing = computeBookingPrice({ bookable, hours });

  const reviewForm = useForm({
    resolver: zodResolver(bookingReviewValidationSchema),
    defaultValues: { paymentMethod: PAYMENT_METHODS.COD, acceptTerms: false },
  });
  const reviewValues = useWatch({ control: reviewForm.control });

  // ---- Navigation ----
  const goToStep = (nextStep) => {
    setStep(nextStep);
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    window.scrollTo({ top: Math.max(window.scrollY + top - 96, 0), behavior: "smooth" });
  };

  const submitSchedule = scheduleForm.handleSubmit(() => goToStep(STEP_ADDRESS));

  const submitAddress = addressForm.handleSubmit(() => goToStep(STEP_REVIEW));

  // ---- Step 4: confirmed ----
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Both kinds of booking are created through the booking API; the confirmed
  // step shows the booking number, status and professional it returns. A
  // taken slot (409) sends the customer back to pick another time - the
  // reason itself is toasted by httpClient.
  const placeServiceBooking = async () => {
    const payload = toCreateBookingPayload({
      bookable,
      day: selectedDay,
      slot: selectedSlot,
      address: selectedAddress,
      contact: {
        contactName: addressValues.contactName,
        phone: addressValues.contactPhone,
        instructions: addressValues.instructions,
      },
      provider,
      user,
    });
    try {
      return fromCreatedBooking(await dispatch(createBooking(payload)).unwrap());
    } catch (error) {
      if (error?.status === CONFLICT_STATUS) {
        updateSchedule("slot", "");
        setProvider(null);
        goToStep(STEP_SCHEDULE);
      }
      return null;
    }
  };

  // POST /bookings/workers - the backend works out the end time and price
  // and re-checks the worker is still free. On a clash the worker's start
  // times are reloaded so the taken ones show as unavailable.
  const placeWorkerBooking = async () => {
    const payload = toCreateWorkerBookingPayload({
      bookable,
      day: selectedDay,
      slot: selectedSlot,
      hours,
      address: selectedAddress,
      contact: {
        contactName: addressValues.contactName,
        phone: addressValues.contactPhone,
        instructions: addressValues.instructions,
      },
      user,
    });
    try {
      return fromCreatedBooking(await dispatch(createWorkerBooking(payload)).unwrap());
    } catch (error) {
      if (error?.status === CONFLICT_STATUS) {
        updateSchedule("slot", "");
        loadSchedule();
        goToStep(STEP_SCHEDULE);
      }
      return null;
    }
  };

  const submitReview = reviewForm.handleSubmit(async () => {
    const placed = bookable.perHour ? await placeWorkerBooking() : await placeServiceBooking();
    if (!placed) return;
    const booking = {
      id: placed.id,
      status: placed.status,
      bookable,
      date: selectedDay.date,
      dateKey: selectedDay.key,
      slot: selectedSlot,
      hours,
      address: selectedAddress,
      contact: {
        name: addressValues.contactName,
        phone: formatPhoneNumberIntl(addressValues.contactPhone) || addressValues.contactPhone,
        instructions: addressValues.instructions,
      },
      total: pricing.total,
      // The professional who was assigned (the backend picks one for "any").
      provider: placed.provider ?? provider,
    };
    setConfirmedBooking(booking);
    // The booking shows on My bookings from the API.
    goToStep(STEP_DONE);
  });

  const isDone = step === STEP_DONE && confirmedBooking;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div ref={topRef} className="relative mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
        <BookingHeader
          bookable={bookable}
          currentStep={step}
          isComplete={Boolean(isDone)}
          onStepClick={isDone ? undefined : goToStep}
        />

        <div className={`mt-8 grid grid-cols-1 gap-8 ${isDone ? "" : "lg:grid-cols-[1fr_380px]"}`}>
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {step === STEP_SCHEDULE && (
                <motion.div key="schedule" {...stepMotion}>
                  <BookingScheduleSection
                    bookable={bookable}
                    days={days}
                    isLoadingDays={scheduleStatus === "loading" || scheduleStatus === "idle"}
                    daysFailed={scheduleStatus === "failed"}
                    onRetryDays={loadSchedule}
                    maxHours={maxHours}
                    values={{ date: schedule.date, slot: schedule.slot, hours }}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    slotError={scheduleForm.formState.errors.slot?.message ?? scheduleForm.formState.errors.date?.message}
                    onDateChange={handleDateChange}
                    onSlotChange={handleSlotChange}
                    onHoursChange={handleHoursChange}
                    provider={pickProvider ? provider : undefined}
                    onChangeProvider={pickProvider ? openProviderModal : undefined}
                    onSubmit={submitSchedule}
                  />
                </motion.div>
              )}

              {step === STEP_ADDRESS && (
                <motion.div key="address" {...stepMotion}>
                  <BookingAddressSection
                    bookable={bookable}
                    form={{
                      register: addressForm.register,
                      control: addressForm.control,
                      setValue: addressForm.setValue,
                      formState: addressForm.formState,
                      values: addressValues,
                    }}
                    addresses={addresses}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    onAddressSaved={handleAddressSaved}
                    onEditSchedule={() => goToStep(STEP_SCHEDULE)}
                    onBack={() => goToStep(STEP_SCHEDULE)}
                    onSubmit={submitAddress}
                  />
                </motion.div>
              )}

              {step === STEP_REVIEW && (
                <motion.div key="review" {...stepMotion}>
                  <BookingReviewSection
                    bookable={bookable}
                    hours={hours}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    address={selectedAddress}
                    contact={{
                      name: addressValues.contactName,
                      phone: formatPhoneNumberIntl(addressValues.contactPhone) || addressValues.contactPhone,
                      instructions: addressValues.instructions,
                    }}
                    pricing={pricing}
                    provider={pickProvider ? provider : undefined}
                    form={{
                      register: reviewForm.register,
                      formState: reviewForm.formState,
                      values: reviewValues,
                    }}
                    onEditSchedule={() => goToStep(STEP_SCHEDULE)}
                    onEditAddress={() => goToStep(STEP_ADDRESS)}
                    onBack={() => goToStep(STEP_ADDRESS)}
                    onSubmit={submitReview}
                  />
                </motion.div>
              )}

              {isDone && (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <BookingConfirmedSection booking={confirmedBooking} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isDone && (
            <BookingSummaryCard
              bookable={bookable}
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              hours={hours}
              address={step >= STEP_ADDRESS ? selectedAddress : null}
              pricing={pricing}
              provider={pickProvider && selectedSlot ? provider : undefined}
            />
          )}
        </div>
      </div>

      {pickProvider && (
        <BookingProviderModal
          key={providerModal.key}
          open={providerModal.open}
          bookable={bookable}
          day={selectedDay}
          slot={selectedSlot}
          workers={categoryWorkers}
          slotProviders={currentSlotProviders}
          selectedId={provider?.id}
          onConfirm={handleProviderConfirm}
          onClose={closeProviderModal}
          onPickAnotherTime={handlePickAnotherTime}
          onRetry={() => loadSlotProviders(selectedDay?.key, selectedSlot)}
        />
      )}
    </section>
  );
}
