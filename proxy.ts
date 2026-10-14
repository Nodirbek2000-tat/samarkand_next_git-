import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the admin panel and the personal cabinet: without a Django session cookie
 * there is no point rendering them at all. The real authorisation check happens in Django on every API call.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has("sessionid")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/kabinet") ? "/kirish" : "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/kabinet", "/kabinet/:path*"],
};
