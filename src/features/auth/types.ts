export type AuthRequestStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "error";

export type OtpLoginStage = "email" | "otp";

export type SupportedEmailOtpType = "email" | "magiclink";

export interface AuthCallbackInput {
  code?: string;
  tokenHash?: string;
  type?: SupportedEmailOtpType;
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export function isSupportedEmailOtpType(
  value: string | null,
): value is SupportedEmailOtpType {
  return value === "email" || value === "magiclink";
}
