import { useSelector } from "react-redux";

// Read-only view of the bookings slice ({ items }).
export function useBookings() {
  return useSelector((state) => state.bookings);
}
