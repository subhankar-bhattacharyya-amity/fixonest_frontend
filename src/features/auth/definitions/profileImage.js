// Auth-domain presentation helpers shared by every place an avatar is
// rendered (layouts/header/components/UserMenu.jsx, pages/profile/*).
import { appConfig } from "@/lib/config.js";

// user.profile_image is always set - either the customer's uploaded photo
// or backend/app/modules/auth/model/user.model.js's seeded default (a
// bundled placeholder icon) - both are shown as a real <img>, never
// swapped for initials. Initials are only ever a fallback for the rare
// case the image itself fails to load (see each call site's onError).
export function buildProfileImageUrl(user) {
  const image = user?.profileImage || user?.profile_image;
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${appConfig.apiBaseUrl}${path}`;
}

export function initialsOf(fullName) {
  if (!fullName) return "?";
  const [first, second] = fullName.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}
