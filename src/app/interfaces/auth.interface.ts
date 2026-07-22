export interface RefreshTokenResponse {
  ok: boolean;
  data?: {
    accessToken: string;
    // refreshToken: string;
  } | null;
}

/**
 * Temporary login data to verify email or two-factor authentication.
 */
export interface TemporalLoginData {
  apiKey: string;
  remember: boolean;
}

export interface VerifyEmailReq extends TemporalLoginData {
  code: string;
}

export interface AuthInfo {
  with2FA: boolean;
  // verificationEmailDate?: Date | null;
}
