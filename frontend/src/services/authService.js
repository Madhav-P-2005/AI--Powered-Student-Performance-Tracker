// services/authService.js — Auth-related API calls (OTP, password reset, admin actions)

import api from '../config/api';

/**
 * Request a password reset OTP to be sent to the user's email.
 */
export const requestOTP = (email) => {
  return api.post('/auth/forgot-password/', { email });
};

/**
 * Request an email verification OTP for a new registration.
 */
export const sendRegistrationOTP = (email) => {
  return api.post('/auth/send-registration-otp/', { email });
};

/**
 * Complete registration with a verified OTP.
 */
export const verifiedRegister = (userData, otp) => {
  return api.post('/auth/verified-register/', { ...userData, otp });
};

/**
 * Verify a 6-digit OTP code.
 */
export const verifyOTP = (email, otp) => {
  return api.post('/auth/verify-otp/', { email, otp });
};

/**
 * Reset password using a verified OTP.
 */
export const resetPassword = (email, otp, new_password) => {
  return api.post('/auth/reset-password/', { email, otp, new_password });
};

/**
 * Admin: Delete a user account by ID.
 */
export const deleteUser = (userId) => {
  return api.delete(`/auth/users/${userId}/`);
};
