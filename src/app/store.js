import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/index.js";
import { themeReducer } from "@/features/theme/index.js";
import { contactReducer } from "@/features/contact/index.js";
import { blogCommentReducer, blogReducer } from "@/features/blog/index.js";
import { faqReducer } from "@/features/faq/index.js";
import { testimonialsReducer } from "@/features/testimonials/index.js";
import { teamReducer } from "@/features/team/index.js";
import { serviceCategoryReducer, serviceReducer } from "@/features/services/index.js";
import { workerReducer } from "@/features/workers/index.js";
import { bookingReducer } from "@/features/bookings/index.js";
import { addressReducer } from "@/features/addresses/index.js";

// Combines every feature's own slice (see features/<name>/store/*Slice.js).
// Add a new feature's reducer here once its slice exists — never move a
// slice's logic into this file itself.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    contact: contactReducer,
    blog: blogReducer,
    blogComments: blogCommentReducer,
    faq: faqReducer,
    testimonials: testimonialsReducer,
    team: teamReducer,
    serviceCategories: serviceCategoryReducer,
    services: serviceReducer,
    workers: workerReducer,
    bookings: bookingReducer,
    addresses: addressReducer,
  },
});
