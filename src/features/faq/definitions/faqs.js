// backend/app/router/customer/faq.routes.js - public, read-only endpoint (no
// login needed). Returns only Active FAQs.
export const FAQ_API_PATH = "/api/v1/faqs";

// The Home page shows the FAQs filed under its section, in the `order` the
// Super Admin set - the Admin Panel's FAQ Management "Home Page" tab
// (fixonest_admin's features/faq/definitions/faqs.js uses the same value).
export const HOME_FAQ_CATEGORY = "home_page";
export const HOME_FAQ_LIMIT = 10;

// Turns an FAQ from the API into the { id, question, answer } shape
// pages/home/components/FaqSection.jsx renders.
export const toFaq = (faq) => ({
  id: faq._id,
  question: faq.question,
  answer: faq.answer,
});
