// Public API of the team feature. Import from "@/features/team/index.js",
// never reach into store/ from outside this folder.
export { useTeam } from "./hooks/useTeam.js";
export { default as teamReducer, fetchAboutTeam } from "./store/teamSlice.js";
