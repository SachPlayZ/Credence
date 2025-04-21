import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("Middleware - Session:", {
      token: !!req.nextauth.token,
      userId: req.nextauth.token?.id,
      path: req.nextUrl.pathname,
    });

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/onboarding/:path*", "/dashboard/:path*"],
};
