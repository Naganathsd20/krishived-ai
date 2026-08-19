/**
 * Environment Variable Validation Utility for KrishiVed AI.
 * Performs safe server-side validation for required environment variables.
 *
 * IMPORTANT SECURITY RULES:
 * 1. Never expose private secret values to client code.
 * 2. Never print secret values in console logs.
 * 3. Clearly distinguish server-only secrets vs public client variables.
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingServerVars: string[];
  missingPublicVars: string[];
  warnings: string[];
}

/**
 * Safely validates server-side and public environment configuration.
 * Only executes in server environments (Node.js runtime).
 */
export function validateEnvironment(): EnvValidationResult {
  const isServer = typeof window === "undefined";
  const missingServerVars: string[] = [];
  const missingPublicVars: string[] = [];
  const warnings: string[] = [];

  if (!isServer) {
    return {
      isValid: true,
      missingServerVars: [],
      missingPublicVars: [],
      warnings: [],
    };
  }

  // Required Server-Side Variables
  const requiredServerVars = [
    { name: "MONGODB_URI", fallback: false },
    { name: "CLERK_SECRET_KEY", fallback: false },
    { name: "GEMINI_API_KEY", fallback: true },
    { name: "CLOUDINARY_CLOUD_NAME", fallback: true },
    { name: "CLOUDINARY_API_KEY", fallback: true },
    { name: "CLOUDINARY_API_SECRET", fallback: true },
    { name: "DATAGOV_API_KEY", fallback: true },
  ];

  for (const item of requiredServerVars) {
    const val = process.env[item.name];
    if (!val || val.trim() === "") {
      if (item.fallback) {
        warnings.push(
          `Server environment variable '${item.name}' is unconfigured. Runtime fallback provider will be active.`
        );
      } else {
        missingServerVars.push(item.name);
      }
    }
  }

  // Required Public Client Variables
  const requiredPublicVars = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];

  for (const varName of requiredPublicVars) {
    const val = process.env[varName];
    if (!val || val.trim() === "") {
      missingPublicVars.push(varName);
    }
  }

  const isValid = missingServerVars.length === 0 && missingPublicVars.length === 0;

  if (!isValid && process.env.NODE_ENV === "production") {
    console.warn(
      `[Env Validation Warning] Missing configuration: ${[
        ...missingServerVars,
        ...missingPublicVars,
      ].join(", ")}`
    );
  }

  return {
    isValid,
    missingServerVars,
    missingPublicVars,
    warnings,
  };
}

// Auto-run lightweight check on server startup in non-browser context
if (typeof window === "undefined") {
  validateEnvironment();
}
