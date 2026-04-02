import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isReceptionistRoute = createRouteMatcher([
  "/dashboard/receptionist(.*)",
]);
const isDoctorRoute = createRouteMatcher(["/dashboard/doctor(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, orgId, orgRole } = await auth();

    if (!userId) {
      await auth.protect();
      return;
    }

    if (!orgId) {
      return Response.redirect(new URL("/select-org", req.url));
    }

    if (
      isReceptionistRoute(req) &&
      orgRole !== "org:receptionist" &&
      orgRole !== "org:admin"
    ) {
      return Response.redirect(new URL("/dashboard", req.url));
    }

    if (
      isDoctorRoute(req) &&
      orgRole !== "org:doctor" &&
      orgRole !== "org:admin"
    ) {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
