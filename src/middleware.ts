import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest, NextResponse } from "next/server";
import { LOCALES } from "./app/lib/constants";

let defaultLocale = "en";

function getLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  let headers = {
    "accept-language": request.headers.get("accept-language") || "en",
  };
  let languages = new Negotiator({ headers }).languages();
  return match(languages, LOCALES, defaultLocale);
}

function isBot(userAgent: string) {
  return /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou/i.test(
    userAgent
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/opengraph-image.png") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/image-sitemap.xml") ||
    pathname.startsWith("/BingSiteAuth.xml")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  if (isBot(userAgent)) {
    return NextResponse.next();
  }

  const locale = getLocale(request);

  if (locale === defaultLocale) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );

  response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|images|fonts|videos|favicon.ico|opengraph-image.png|api|sitemap|image-sitemap|BingSiteAuth).*)",
  ],
};
