import { useSelector } from "react-redux";

// Read-only view of the services slice ({ featured, catalog, details, related }).
// Loading is done by dispatching the slice's thunks - see features/services/store/serviceSlice.js.
export function useServices() {
  return useSelector((state) => state.services);
}
