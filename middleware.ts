import { NextRequest } from "next/server";
import { availableLocaleCodes, defaultLocale } from "./next.locales.mjs";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { rateLimiter } from "./lib/rate-limit";

const intlMiddleware = createMiddleware({
  locales: availableLocaleCodes,
  defaultLocale: defaultLocale.code,
  localePrefix: "always",
  alternateLinks: false,
});

export default async function middleware(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiter(req);
  if (rateLimitResult) return rateLimitResult;

  const token = await getToken({ req });
  const pathname = req.nextUrl.pathname;

  // Check both root path and localized root path
  if (
    token &&
    (pathname === "/" ||
      availableLocaleCodes.some((locale) => pathname === `/${locale}`))
  ) {
    const locale = pathname.split("/")[1] || defaultLocale.code;
    return Response.redirect(new URL(`/${locale}/explore`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
