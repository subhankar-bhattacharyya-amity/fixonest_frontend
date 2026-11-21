import { useSelector } from "react-redux";

// Read-only view of the addresses slice ({ items }).
export function useAddresses() {
  return useSelector((state) => state.addresses);
}
