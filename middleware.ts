import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analytics(.*)",
  "/disease-detection(.*)",
  "/weather-soil(.*)",
  "/ai-assistant(.*)",
  "/field-reports(.*)",
  "/crop-advisory(.*)",
  "/yield-intelligence(.*)",
  "/quality-assurance(.*)",
  "/settings(.*)",
  "/help-support(.*)",
  "/profile(.*)",
  "/mandi-prices(.*)",
  "/government-schemes(.*)",
  "/farm-diary(.*)",
  "/agriculture-centers(.*)",
  "/crop-schedule(.*)",
  "/irrigation(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
