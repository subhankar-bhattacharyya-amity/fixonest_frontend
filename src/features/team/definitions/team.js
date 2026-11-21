import { appConfig } from "@/lib/config.js";

// backend/app/router/customer/team_management.routes.js - public, read-only
// endpoint (no login needed). Returns only Active team members, managed by
// the Super Admin.
export const TEAM_API_PATH = "/api/v1/team-members";
export const ABOUT_TEAM_LIMIT = 24;

// avatar is either an upload path served by the backend
// ("uploads/team/<file>") or an absolute http(s) URL. null when empty.
const buildAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `${appConfig.apiBaseUrl}/${avatar.replace(/^\/+/, "")}`;
};

const initialsOf = (name = "") => {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
};

// Turns a team member from the API into the shape
// pages/about/components/AboutTeamSection.jsx renders.
export const toTeamMember = (member) => ({
  id: member._id,
  name: member.name,
  role: member.designation,
  avatar: buildAvatarUrl(member.avatar),
  initials: initialsOf(member.name),
  linkedin: member.linkedin || null,
});
