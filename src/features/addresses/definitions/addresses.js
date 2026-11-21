import { Briefcase, House, MapPin } from "lucide-react";

// The customer's address endpoints (backend router/customer/user.routes.js).
export const ADDRESSES_API_PATH = "/api/v1/user/addresses";

// The address types a customer can save (the backend's addressType enum,
// capitalised). The type is kept in the address's `label` field, which the
// booking flow already reads.
export const ADDRESS_TYPES = ["Home", "Work", "Other"];

// Types a customer can have only one of - the backend allows a single Home
// (a second one is rejected with 409); Work and Other can repeat.
export const SINGLE_ADDRESS_TYPES = ["Home"];
export const isSingleAddressType = (type) => SINGLE_ADDRESS_TYPES.includes(type);

// Look of each type: icon, short hint for the dropdown, and its colours.
export const ADDRESS_TYPE_META = {
  Home: {
    icon: House,
    hint: "Where you live",
    gradient: "from-indigo-600 via-violet-600 to-fuchsia-600",
    soft: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  Work: {
    icon: Briefcase,
    hint: "Your office or workplace",
    gradient: "from-fuchsia-600 via-pink-600 to-rose-500",
    soft: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  },
  Other: {
    icon: MapPin,
    hint: "Family, friends or anywhere else",
    gradient: "from-sky-500 via-indigo-500 to-violet-600",
    soft: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
};

export const getAddressTypeMeta = (type) => ADDRESS_TYPE_META[type] ?? ADDRESS_TYPE_META.Home;

// "home" -> "Home" (the backend stores the type in lowercase).
const toAddressType = (type) => {
  const match = ADDRESS_TYPES.find((item) => item.toLowerCase() === String(type ?? "").toLowerCase());
  return match ?? "Other";
};

// One backend address (a /me `user_details` item, or what the address
// endpoints return) in the shape the address cards and the booking flow
// read. The backend keeps companyName (Work only) and road; houseNo / area
// are the two display lines built from them - the company name first when
// there is one, otherwise the road. The backend stores no landmark.
export const toAddress = (detail) => {
  const label = toAddressType(detail.addressType);
  const companyName = label === "Work" ? detail.companyName ?? "" : "";
  const road = detail.road ?? "";
  return {
    id: detail._id,
    label,
    companyName,
    road,
    houseNo: companyName || road,
    area: companyName ? road : "",
    landmark: "",
    city: detail.city ?? "",
    state: detail.state ?? "",
    pincode: detail.pincode ?? "",
    country: detail.country ?? "",
    isDefault: Boolean(detail.is_default),
    createdAt: detail.createdAt ?? null,
  };
};

// The logged-in user's saved addresses from their /me profile.
export const toAddresses = (user) => (Array.isArray(user?.user_details) ? user.user_details.map(toAddress) : []);

// The add / edit form's values (components/AddressFormModal.jsx).
export const EMPTY_ADDRESS_VALUES = {
  label: "",
  companyName: "",
  road: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export const toAddressFormValues = (address) => ({
  label: address.label,
  companyName: address.companyName ?? "",
  road: address.road ?? "",
  city: address.city ?? "",
  state: address.state ?? "",
  pincode: address.pincode ?? "",
  isDefault: Boolean(address.isDefault),
});

// Form values -> the body POST / PATCH /user/addresses expect. companyName
// is only kept for Work (the backend drops it for other types anyway).
export const toAddressPayload = (values) => ({
  addressType: values.label.toLowerCase(),
  companyName: values.label === "Work" ? values.companyName.trim() : "",
  road: values.road.trim(),
  city: values.city.trim(),
  state: values.state.trim(),
  pincode: values.pincode.trim(),
  is_default: Boolean(values.isDefault),
});

// "12 Lake View Road, Ballygunge, Kolkata 700019"
export const formatAddressLine = (address) =>
  [address.area, `${address.city ?? ""} ${address.pincode ?? ""}`.trim()].filter(Boolean).join(", ");

// The whole address as one string, for the summary card and the ticket.
export const formatFullAddress = (address) =>
  [
    address.houseNo,
    address.area,
    address.landmark,
    address.city,
    [address.state, address.pincode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
