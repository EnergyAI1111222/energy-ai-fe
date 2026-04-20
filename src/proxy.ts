import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/eu(.*)",
  "/catalog(.*)",
  "/datasets(.*)",
  "/settings(.*)",
  "/export-data(.*)",
  "/picasso(.*)",
  "/billing(.*)",
  "/futures(.*)",
  "/gas(.*)",
  "/insights(.*)",
  "/alerts(.*)",
  "/record-tracker(.*)",
  "/nodal-analyse(.*)",
  "/retail(.*)",
  "/imbalance-capacity(.*)",
  "/custom-dashboards(.*)",
  "/my-grid(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkKey || clerkKey === "pk_test_placeholder") {
    return NextResponse.next();
  }

  if (process.env.STEALTH_PASSWORD) {
    const basicAuth = request.headers.get("authorization");
    let isAuthenticated = false;
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const decodedValue = atob(authValue);
      const [, pwd] = decodedValue.split(":");
      if (pwd === process.env.STEALTH_PASSWORD) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
