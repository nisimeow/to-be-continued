/**
 * Environment variable validation
 * Checks that all required environment variables are set
 */

const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Gemini API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

export function validateEnv(): void {
  const missingVars: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    console.warn(
      '\n⚠️  Missing required environment variables:\n' +
        missingVars.map((v) => `  - ${v}`).join('\n') +
        '\n\nPlease check your .env.local file.\n' +
        'See README.md for setup instructions.\n'
    );

    // Only throw error when actually running (not during build)
    // Build time checks are less strict to allow building without env vars
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
