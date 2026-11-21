import { useSelector } from "react-redux";

// Read-only view of the workers slice ({ list, details }). Loading is done by
// dispatching the slice's thunks - see features/workers/store/workerSlice.js.
export function useWorkers() {
  return useSelector((state) => state.workers);
}
