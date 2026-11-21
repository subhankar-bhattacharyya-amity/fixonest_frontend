import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getJson, patchJson, postJson } from "@/lib/httpClient.js";
import { toWorker } from "@/features/workers/index.js";
import {
  ARRIVAL_WINDOWS_API_PATH,
  BOOKINGS_API_PATH,
  MY_BOOKINGS_API_PATH,
  MY_BOOKINGS_PAGE_SIZE,
  MY_BOOKINGS_STATISTICS_API_PATH,
  SLOT_PROVIDERS_API_PATH,
  SLOT_PROVIDERS_PAGE_SIZE,
  WORKER_BOOKINGS_API_PATH,
  getCancelBookingApiPath,
  getMyBookingApiPath,
  getWorkerAvailabilityApiPath,
  toArrivalWindows,
  toBookingStatistics,
  toMyBookingRecord,
  toWorkerSchedule,
} from "../definitions/bookings.js";

// "2026-11-02|09:00|10:00|<serviceId>" - which slot a provider list is for.
export const getSlotKey = ({ serviceId, date, startTime, endTime }) => `${date}|${startTime}|${endTime}|${serviceId}`;

const initialState = {
  // The My bookings list: the customer's bookings from the API.
  items: [],
  // The GET /bookings/my-bookings call.
  list: { status: "idle" },
  // GET /bookings/my-bookings/statistics - the hero cards and tab counts.
  statistics: { upcoming: 0, completed: 0, cancelled: 0, paidInCash: 0, status: "idle" },
  // GET /bookings/my-bookings/:id per booking ({ [apiId]: "loading" | "succeeded" | "failed" }).
  detailsStatus: {},
  // PATCH /bookings/my-bookings/:id/cancel per booking (same statuses).
  cancelStatus: {},
  // Worker bookings: one worker's start times per day from `from` onwards and
  // how many hours each allows (see toWorkerSchedule).
  workerAvailability: { workerId: null, from: null, byDate: {}, dayCount: 0, maxHours: 0, status: "idle" },
  // Service bookings' arrival windows per day from `from` onwards, how many
  // days can be booked and the minimum notice in hours (see toArrivalWindows).
  arrivalWindows: { from: null, byDate: {}, dayCount: 0, leadHours: 0, status: "idle" },
  // Professionals of a service who are free at one arrival window - the
  // "Choose your professional" modal.
  slotProviders: { key: null, items: [], isWorkingDay: true, reason: null, status: "idle" },
  // The POST /bookings or POST /bookings/workers call.
  create: { status: "idle" },
};

// "<workerId>|2026-11-12" - which worker and days an availability answer is for.
const getWorkerAvailabilityKey = ({ workerId, from }) => `${workerId}|${from}`;

// backend booking.controller.js getWorkerAvailability - every bookable day
// (the admin's "book up to") from `from` ("YYYY-MM-DD", the customer's today)
// for one worker. Skipped while the same request is already loading
// (StrictMode runs effects twice in development).
export const fetchWorkerAvailability = createAsyncThunk(
  "bookings/fetchWorkerAvailability",
  async ({ workerId, from }, { rejectWithValue }) => {
    const params = new URLSearchParams({ from });
    try {
      return await getJson(`${getWorkerAvailabilityApiPath(workerId)}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (arg, { getState }) => {
      const { workerAvailability } = getState().bookings;
      return !(
        getWorkerAvailabilityKey(workerAvailability) === getWorkerAvailabilityKey(arg) &&
        workerAvailability.status === "loading"
      );
    },
  },
);

// backend working_hours.controller.js getArrivalWindows - every bookable day
// (the admin's "book up to") from `from` ("YYYY-MM-DD", the customer's
// today). Skipped while the same request is already loading (StrictMode runs
// effects twice in development).
export const fetchArrivalWindows = createAsyncThunk(
  "bookings/fetchArrivalWindows",
  async ({ from }, { rejectWithValue }) => {
    const params = new URLSearchParams({ from });
    try {
      return await getJson(`${ARRIVAL_WINDOWS_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: ({ from }, { getState }) => {
      const { arrivalWindows } = getState().bookings;
      return !(arrivalWindows.from === from && arrivalWindows.status === "loading");
    },
  },
);

// backend provider_availability.controller.js getAvailableProviders. Times
// are "HH:mm"; `data` is the list of the service's providers free in that
// slot (same shape as GET /api/v1/providers).
export const fetchSlotProviders = createAsyncThunk(
  "bookings/fetchSlotProviders",
  async ({ serviceId, date, startTime, endTime }, { rejectWithValue }) => {
    const params = new URLSearchParams({
      service_id: serviceId,
      date,
      startTime,
      endTime,
      page: "1",
      per_page: String(SLOT_PROVIDERS_PAGE_SIZE),
    });
    try {
      return await getJson(`${SLOT_PROVIDERS_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend booking.controller.js createBooking. `payload` is the request body
// (see pages/booking/definitions/bookingRequest.js). Resolves with the saved
// booking; rejects with { status, message } so the flow can react to a
// taken slot (409). The error itself is toasted by httpClient.
export const createBooking = createAsyncThunk("bookings/createBooking", async (payload, { rejectWithValue }) => {
  try {
    const response = await postJson(BOOKINGS_API_PATH, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue({ status: error.response?.status ?? null, message: error.response?.data?.message ?? null });
  }
});

// backend booking.controller.js createWorkerBooking - books a worker by the
// hour. `payload` is the request body (see
// pages/booking/definitions/bookingRequest.js); the backend works out the end
// time and price. Resolves / rejects like createBooking.
export const createWorkerBooking = createAsyncThunk(
  "bookings/createWorkerBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await postJson(WORKER_BOOKINGS_API_PATH, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue({ status: error.response?.status ?? null, message: error.response?.data?.message ?? null });
    }
  },
);

// backend booking.controller.js listBookings (customer scope = own bookings,
// newest first). Loads every page so the tab counts and the search see them
// all; resolves with the raw bookings. Skipped while the list is already
// loading (React StrictMode runs effects twice in development).
export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const bookings = [];
      let page = 1;
      let totalPages = 1;
      do {
        const params = new URLSearchParams({ page: String(page), per_page: String(MY_BOOKINGS_PAGE_SIZE) });
        const response = await getJson(`${MY_BOOKINGS_API_PATH}?${params}`);
        bookings.push(...(response.data ?? []));
        totalPages = Number(response.meta?.totalPages) || 1;
        page += 1;
      } while (page <= totalPages);
      return bookings;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (_, { getState }) => getState().bookings.list.status !== "loading",
  },
);

// backend booking.controller.js getBookingById - one of the customer's
// bookings, fresh (status, professional, timestamps), for "View details".
// `id` is the booking's Mongo _id (record.apiId).
export const fetchBookingDetails = createAsyncThunk(
  "bookings/fetchBookingDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getJson(getMyBookingApiPath(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (id, { getState }) => getState().bookings.detailsStatus[id] !== "loading",
  },
);

// backend booking.controller.js getBookingStatistics - the customer's
// upcoming / completed / cancelled counts and the cash paid for completed
// jobs. Skipped while already loading (React StrictMode runs effects twice).
export const fetchMyBookingStatistics = createAsyncThunk(
  "bookings/fetchMyBookingStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getJson(MY_BOOKINGS_STATISTICS_API_PATH);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (_, { getState }) => getState().bookings.statistics.status !== "loading",
  },
);

// backend booking.controller.js cancelBooking - only a pending or accepted
// booking can be cancelled. `id` is the Mongo _id (record.apiId); `reason`
// is optional (the backend saves "Cancelled by customer" without one).
// Resolves with the updated booking. The error itself is toasted by httpClient.
export const cancelMyBooking = createAsyncThunk(
  "bookings/cancelMyBooking",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await patchJson(getCancelBookingApiPath(id), reason ? { reason } : {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: ({ id }, { getState }) => getState().bookings.cancelStatus[id] !== "loading",
  },
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkerAvailability.pending, (state, action) => {
        const { workerId, from } = action.meta.arg;
        // Keep the start times when re-checking the same worker and days.
        if (getWorkerAvailabilityKey(state.workerAvailability) !== getWorkerAvailabilityKey(action.meta.arg)) {
          state.workerAvailability = { ...initialState.workerAvailability, workerId, from };
        }
        state.workerAvailability.status = "loading";
      })
      // Only the latest worker / days win, so a slow earlier answer can't
      // show another worker's times.
      .addCase(fetchWorkerAvailability.fulfilled, (state, action) => {
        if (getWorkerAvailabilityKey(state.workerAvailability) !== getWorkerAvailabilityKey(action.meta.arg)) return;
        state.workerAvailability = {
          ...state.workerAvailability,
          ...toWorkerSchedule(action.payload.data),
          status: "succeeded",
        };
      })
      .addCase(fetchWorkerAvailability.rejected, (state, action) => {
        if (getWorkerAvailabilityKey(state.workerAvailability) !== getWorkerAvailabilityKey(action.meta.arg)) return;
        state.workerAvailability.status = "failed";
      })

      .addCase(fetchArrivalWindows.pending, (state, action) => {
        // Keep the windows when re-checking the same days.
        if (state.arrivalWindows.from !== action.meta.arg.from) state.arrivalWindows.byDate = {};
        state.arrivalWindows.from = action.meta.arg.from;
        state.arrivalWindows.status = "loading";
      })
      .addCase(fetchArrivalWindows.fulfilled, (state, action) => {
        if (state.arrivalWindows.from !== action.meta.arg.from) return;
        state.arrivalWindows = {
          ...state.arrivalWindows,
          ...toArrivalWindows(action.payload.data),
          status: "succeeded",
        };
      })
      .addCase(fetchArrivalWindows.rejected, (state, action) => {
        if (state.arrivalWindows.from !== action.meta.arg.from) return;
        state.arrivalWindows.status = "failed";
      })

      .addCase(fetchSlotProviders.pending, (state, action) => {
        const key = getSlotKey(action.meta.arg);
        // Keep the list when re-checking the same slot.
        if (state.slotProviders.key !== key) {
          state.slotProviders.items = [];
          state.slotProviders.isWorkingDay = true;
          state.slotProviders.reason = null;
        }
        state.slotProviders.key = key;
        state.slotProviders.status = "loading";
      })
      // Only the latest slot wins, so a slow earlier answer can't show the
      // wrong providers for the slot now selected.
      .addCase(fetchSlotProviders.fulfilled, (state, action) => {
        if (state.slotProviders.key !== getSlotKey(action.meta.arg)) return;
        state.slotProviders.status = "succeeded";
        state.slotProviders.items = (action.payload.data ?? []).map(toWorker);
        // This endpoint returns no closed-day flag (closed days can't be
        // picked anyway); an empty list shows as "nobody free".
        state.slotProviders.isWorkingDay = true;
        state.slotProviders.reason = null;
      })
      .addCase(fetchSlotProviders.rejected, (state, action) => {
        if (state.slotProviders.key !== getSlotKey(action.meta.arg)) return;
        state.slotProviders.status = "failed";
      })

      .addCase(fetchMyBookings.pending, (state) => {
        state.list.status = "loading";
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.items = action.payload.map(toMyBookingRecord);
      })
      .addCase(fetchMyBookings.rejected, (state) => {
        state.list.status = "failed";
      })

      .addCase(fetchBookingDetails.pending, (state, action) => {
        state.detailsStatus[action.meta.arg] = "loading";
      })
      // Swap the list's copy for the fresh one (its status may have moved on).
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.detailsStatus[action.meta.arg] = "succeeded";
        const index = state.items.findIndex((item) => item.apiId === action.meta.arg);
        if (index !== -1 && action.payload) state.items[index] = toMyBookingRecord(action.payload);
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.detailsStatus[action.meta.arg] = "failed";
      })

      .addCase(fetchMyBookingStatistics.pending, (state) => {
        state.statistics.status = "loading";
      })
      .addCase(fetchMyBookingStatistics.fulfilled, (state, action) => {
        state.statistics = { ...toBookingStatistics(action.payload), status: "succeeded" };
      })
      .addCase(fetchMyBookingStatistics.rejected, (state) => {
        state.statistics.status = "failed";
      })

      .addCase(cancelMyBooking.pending, (state, action) => {
        state.cancelStatus[action.meta.arg.id] = "loading";
      })
      // The cancelled booking moves to the Cancelled tab with the backend's reason.
      .addCase(cancelMyBooking.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        state.cancelStatus[id] = "succeeded";
        const index = state.items.findIndex((item) => item.apiId === id);
        if (index !== -1 && action.payload) state.items[index] = toMyBookingRecord(action.payload);
      })
      .addCase(cancelMyBooking.rejected, (state, action) => {
        state.cancelStatus[action.meta.arg.id] = "failed";
      })

      .addCase(createBooking.pending, (state) => {
        state.create.status = "loading";
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.create.status = "succeeded";
      })
      .addCase(createBooking.rejected, (state) => {
        state.create.status = "failed";
      })

      .addCase(createWorkerBooking.pending, (state) => {
        state.create.status = "loading";
      })
      .addCase(createWorkerBooking.fulfilled, (state) => {
        state.create.status = "succeeded";
      })
      .addCase(createWorkerBooking.rejected, (state) => {
        state.create.status = "failed";
      });
  },
});

export default bookingSlice.reducer;
