import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export interface SerializedUser {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  image: string;
  role: string;
  language: string;
  defaultLocation?: string;
  defaultCrop?: string;
  notificationPreferences?: {
    diseaseAlerts: boolean;
    weatherAlerts: boolean;
    soilAdvisories: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Retrieves the current authenticated user from Clerk and synchronizes
 * their profile data with MongoDB (creating a new User document if one does not exist).
 */
export async function getOrCreateUser(): Promise<SerializedUser | null> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    await connectDB();

    const primaryEmail =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "";

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "Farmer";

    const image = clerkUser.imageUrl || "";

    // 1. Check if user exists by clerkId
    let mongoUser = await User.findOne({ clerkId: clerkUser.id });

    if (!mongoUser && primaryEmail) {
      // 2. Fallback check by email to prevent duplicate key errors
      mongoUser = await User.findOne({ email: primaryEmail });

      if (mongoUser) {
        mongoUser.clerkId = clerkUser.id;
        if (name) mongoUser.name = name;
        if (image) mongoUser.image = image;
        await mongoUser.save();
      }
    }

    if (!mongoUser) {
      // 3. Create user if not present
      mongoUser = await User.create({
        clerkId: clerkUser.id,
        name,
        email: primaryEmail,
        image,
        role: "Farmer",
        language: "English",
        defaultLocation: "Pune",
        defaultCrop: "Wheat & Mustard",
        notificationPreferences: {
          diseaseAlerts: true,
          weatherAlerts: true,
          soilAdvisories: true,
        },
      });
    } else {
      // 4. Update profile fields if updated in Clerk
      let hasChanges = false;
      if (name && mongoUser.name !== name) {
        mongoUser.name = name;
        hasChanges = true;
      }
      if (primaryEmail && mongoUser.email !== primaryEmail) {
        mongoUser.email = primaryEmail;
        hasChanges = true;
      }
      if (image && mongoUser.image !== image) {
        mongoUser.image = image;
        hasChanges = true;
      }
      if (hasChanges) {
        await mongoUser.save();
      }
    }

    return JSON.parse(JSON.stringify(mongoUser));
  } catch (error) {
    console.error("Error in getOrCreateUser sync:", error);
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const primaryEmail =
          clerkUser.emailAddresses?.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          )?.emailAddress ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          "";

        const name =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          clerkUser.username ||
          "Farmer";

        return {
          _id: clerkUser.id,
          clerkId: clerkUser.id,
          name,
          email: primaryEmail,
          image: clerkUser.imageUrl || "",
          role: "Farmer",
          language: "English",
          defaultLocation: "Pune",
          defaultCrop: "Wheat & Mustard",
          notificationPreferences: {
            diseaseAlerts: true,
            weatherAlerts: true,
            soilAdvisories: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (fallbackErr) {
      console.error("Clerk fallback error:", fallbackErr);
    }
    return null;
  }
}
