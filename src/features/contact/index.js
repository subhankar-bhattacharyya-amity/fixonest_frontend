// Public API of the contact feature. Import from "@/features/contact/index.js",
// never reach into store/ from outside this folder.
export { default as contactReducer, submitContact, submitProviderContact } from "./store/contactSlice.js";
