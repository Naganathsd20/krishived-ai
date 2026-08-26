import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { IAdminAuthResult } from "@/types/admin";

/**
 * Server-side reusable administrator access verification helper.
 *
 * Security Enforcement Rules:
 * 1. Invokes Clerk auth() to retrieve the authenticated user ID.
 * 2. Queries MongoDB User model for the user's role ("Admin" vs "Farmer").
 * 3. Supports server-side ADMIN_EMAILS / ADMIN_CLERK_IDS environment whitelists.
 * 4. Rejects normal farmers with 403 Forbidden.
 * 5. Rejects unauthenticated requests with 401 Unauthorized.
 * 6. Never trusts client-provided headers or payload role values.
 */
export async function verifyAdminAccess(): Promise<IAdminAuthResult> {
  try {
    // 1. Verify Clerk Authentication
    const { userId } = await auth();

    if (!userId) {
      return {
        isAuthorized: false,
        status: 401,
        error: "Unauthorized. Please sign in to access administrative resources.",
      };
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Query User Document in MongoDB
    let mongoUser = await User.findOne({ clerkId: userId }).lean();

    // 4. Fallback check via Clerk currentUser email if MongoDB user document sync is pending
    let userEmail = mongoUser?.email || "";
    if (!userEmail) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          userEmail =
            clerkUser.emailAddresses?.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "";

          if (!mongoUser && userEmail) {
            mongoUser = await User.findOne({ email: userEmail }).lean();
          }
        }
      } catch (clerkErr) {
        console.warn("Admin auth Clerk currentUser warning:", clerkErr);
      }
    }

    // 5. Admin Authorization Checks

    // Check 1: User document role field in MongoDB
    if (mongoUser && mongoUser.role && mongoUser.role.toLowerCase() === "admin") {
      return {
        isAuthorized: true,
        status: 200,
        userId,
        userRole: "Admin",
      };
    }

    // Check 2: Server Environment Email Whitelist (e.g. ADMIN_EMAILS="admin@krishived.ai,naganath@krishived.ai")
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    if (adminEmailsEnv && userEmail) {
      const allowedEmails = adminEmailsEnv
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (allowedEmails.includes(userEmail.toLowerCase())) {
        return {
          isAuthorized: true,
          status: 200,
          userId,
          userRole: "Admin (Whitelist)",
        };
      }
    }

    // Check 3: Server Environment Clerk ID Whitelist (e.g. ADMIN_CLERK_IDS="user_xxx,user_yyy")
    const adminClerkIdsEnv = process.env.ADMIN_CLERK_IDS || "";
    if (adminClerkIdsEnv && userId) {
      const allowedIds = adminClerkIdsEnv
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (allowedIds.includes(userId)) {
        return {
          isAuthorized: true,
          status: 200,
          userId,
          userRole: "Admin (ID Whitelist)",
        };
      }
    }

    // Default Fallback: Development mode auto-grant for local sandbox testing if explicitly enabled
    if (process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_ADMIN === "true") {
      return {
        isAuthorized: true,
        status: 200,
        userId,
        userRole: "Admin (Dev Mode)",
      };
    }

    // 6. Reject normal farmers / unauthorized users with 403 Forbidden
    return {
      isAuthorized: false,
      status: 403,
      error: "Forbidden. Administrative privileges required to view platform metrics.",
    };
  } catch (error) {
    console.error("Error in verifyAdminAccess:", error instanceof Error ? error.stack : error);
    return {
      isAuthorized: false,
      status: 500,
      error: "Internal server error during authorization verification.",
    };
  }
}
