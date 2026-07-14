import { NextResponse, type NextRequest } from "next/server";
import { completeAuthCallback } from "@/features/auth/services/server-auth-service";
import { isSupportedEmailOtpType } from "@/features/auth/types";

function getSafeDestination(value: string | null): string {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/record";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const tokenHash =
    request.nextUrl.searchParams.get("token_hash") ?? undefined;
  const rawType = request.nextUrl.searchParams.get("type");
  const type = isSupportedEmailOtpType(rawType) ? rawType : undefined;

  const success = await completeAuthCallback({
    code,
    tokenHash,
    type,
  });

  if (!success) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "auth_callback");
    return NextResponse.redirect(loginUrl);
  }

  const destination = getSafeDestination(
    request.nextUrl.searchParams.get("next"),
  );
  return NextResponse.redirect(new URL(destination, request.url));
}
