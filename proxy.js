import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("tpm_token")?.value;
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");

  // Authentication pages and APIs remain accessible
  if (isLoginPage || isAuthApi) {
    return NextResponse.next();
  }

  // No login cookie = send user to login
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Token exists. Full verification happens server-side.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};