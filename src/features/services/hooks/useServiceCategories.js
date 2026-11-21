import { useSelector } from "react-redux";

// Read-only view of the service categories slice ({ popular }). Loading is
// done by dispatching the slice's thunks - see features/services/store/serviceCategorySlice.js.
export function useServiceCategories() {
  return useSelector((state) => state.serviceCategories);
}
