// Public API of the addresses feature (the customer's saved Home / Work /
// Other addresses). Import from "@/features/addresses/index.js", never reach into
// store/ from outside this folder. Listed from GET /api/v1/auth/me and saved
// through /api/v1/user/addresses (see store/addressSlice.js).
export {
  ADDRESS_TYPES,
  ADDRESS_TYPE_META,
  SINGLE_ADDRESS_TYPES,
  isSingleAddressType,
  getAddressTypeMeta,
  formatAddressLine,
  formatFullAddress,
  toAddress,
  toAddresses,
} from "./definitions/addresses.js";
export { addressValidationSchema } from "./definitions/addressValidation.js";
export { useAddresses } from "./hooks/useAddresses.js";
export {
  default as addressReducer,
  saveAddress,
  setDefaultAddress,
  deleteAddress,
} from "./store/addressSlice.js";
export { default as AddressFormModal } from "./components/AddressFormModal.jsx";
export { default as AddressTypeSelect } from "./components/AddressTypeSelect.jsx";
