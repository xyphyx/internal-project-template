/**
 * Convex Auth configuration — Clerk integration.
 *
 * Clerk issues JWTs that Convex verifies using the JWKS endpoint.
 * Set CLERK_JWT_ISSUER_DOMAIN in your Convex environment variables.
 *
 * See: https://docs.convex.dev/auth/clerk
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
