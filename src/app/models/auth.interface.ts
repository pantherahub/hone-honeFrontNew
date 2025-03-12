export interface RefreshTokenResponse {
  ok: boolean;
  data?: {
    accessToken: string;
    // refreshToken: string;
  } | null;
}
