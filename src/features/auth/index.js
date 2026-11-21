// Public API of the auth feature. Import from "@/features/auth/index.js",
// never reach into components/, hooks/, store/, or definitions/ from outside this folder.
export { default as AuthBootstrap } from "./components/AuthBootstrap.jsx";
export { useAuth } from "./hooks/useAuth.js";
export { ROLES } from "./definitions/roles.js";
export { loginValidationSchema } from "./definitions/loginValidation.js";
export { registerValidationSchema } from "./definitions/registerValidation.js";
export { updateProfileValidationSchema } from "./definitions/updateProfileValidation.js";
export { changePasswordValidationSchema } from "./definitions/changePasswordValidation.js";
export { resetPasswordValidationSchema, PASSWORD_RULES } from "./definitions/resetPasswordValidation.js";
export { buildProfileImageUrl, initialsOf } from "./definitions/profileImage.js";
export {
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
  EMAIL_NOT_VERIFIED_CODE,
  otpValidationSchema,
  otpEmailValidationSchema,
} from "./definitions/otpValidation.js";
export {
  readPendingVerification,
  savePendingVerification,
  clearPendingVerification,
} from "./definitions/pendingVerification.js";
export {
  default as authReducer,
  registerCustomer,
  loginCustomer,
  verifyEmailOtp,
  resendEmailOtp,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetCustomerPassword,
  fetchProfile,
  updateProfile,
  updateProfilePhoto,
  changePassword,
  logoutCustomer,
} from "./store/authSlice.js";
