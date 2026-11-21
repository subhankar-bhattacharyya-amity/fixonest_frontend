import { useSelector } from "react-redux";

// Read-only view of the team slice ({ about }). Loading is done by
// dispatching the slice's thunks - see features/team/store/teamSlice.js.
export function useTeam() {
  return useSelector((state) => state.team);
}
