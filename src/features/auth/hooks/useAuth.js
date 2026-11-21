import { useSelector } from "react-redux";

// Read-only view of the auth slice ({ user, token, status, error }). Actions
// (loginCustomer, registerCustomer, logoutCustomer, fetchProfile) are
// createAsyncThunks dispatched directly via react-redux's useDispatch() —
// see features/auth/store/authSlice.js.
export function useAuth() {
  return useSelector((state) => state.auth);
}
