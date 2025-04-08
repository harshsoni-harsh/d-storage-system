import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isOnboardingDone = request.cookies.get("isOnboardingDone")?.value;

  if (!isOnboardingDone && request.nextUrl.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/deals", "/storage-providers", "/connections"],
};
