// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
// MIDDLEWARE: Role-Based Protection & Domain Routing
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

import { NextResponse, type NextRequest } from "next/server";

function getSessionFromCookie(request: NextRequest): {
  role: string | null;
  id: string | null;
} {
  const sessionCookie = request.cookies.get("al_session");

  if (!sessionCookie) {
    return { role: null, id: null };
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return {
      role: session.role || null,
      id: session.id || null,
    };
  } catch {
    return { role: null, id: null };
  }
}

export async function middleware(request: NextRequest) {
  const { role: userRole } = getSessionFromCookie(request);
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // DOMAIN ROUTING (Main Domain vs PPDB Subdomain)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.");
  
  if (!isLocalhost) {
    const hostLower = host.split(":")[0].toLowerCase();
    const isPpdbLegacyDomain = hostLower.startsWith("ppdb.");
    const isSpmbDomain = hostLower.startsWith("spmb.") || isPpdbLegacyDomain;
    const isSafinaDomain = hostLower.startsWith("safina.") || hostLower.startsWith("keuangan.");
    const isAppDomain = isSpmbDomain || isSafinaDomain;

    const pathLower = pathname.toLowerCase();
    const appPaths = [
      "/ppdb", "/spmb", "/login", "/daftar", "/daftar-pindahan", "/daftar-sukses", 
      "/dashboard", "/admin", "/auth", "/pilih-verifikasi", "/send-otp", "/verifikasi-otp",
      "/panitia", "/bank-soal"
    ];
    const isAppPath = appPaths.some(p => pathLower === p || pathLower.startsWith(p + "/"));
    
    // Only redirect if not an API or internal Next.js path
    const isStaticOrApi = pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");
    
    if (!isStaticOrApi) {
      // 1. Auto-redirect legacy ppdb.* to spmb.*
      if (isPpdbLegacyDomain) {
        const newHost = hostLower.replace(/^ppdb\./, "spmb.");
        const redirectUrl = new URL(pathname, `https://${newHost}`);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl, 301);
      }

      if (isSafinaDomain) {
        // Auto-redirect keuangan.* to safina.* for brand consistency
        if (hostLower.startsWith("keuangan.")) {
          const redirectUrl = new URL(pathname, `https://${hostLower.replace("keuangan.", "safina.")}`);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }

        // If accessing root of Safina, go straight to login
        if (pathname === "/") {
          const redirectUrl = new URL("/login", request.url);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (isAppDomain && !isAppPath && pathname !== "/") {
        // If on App domain (SPMB/Safina) but trying to access non-App path (like /tentang), redirect to main website
        const mainDomain = hostLower.replace(/^spmb\./, "").replace(/^ppdb\./, "").replace(/^safina\./, "").replace(/^keuangan\./, "");
        const redirectUrl = new URL(pathname, `https://${mainDomain}`);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
      
      if (!isAppDomain && isAppPath) {
        // If on main website domain but trying to access SPMB path, redirect to SPMB domain
        const baseHost = hostLower.replace(/^www\./, "");
        const newPathname = (pathLower === "/ppdb" || pathLower === "/spmb") ? "/" : pathname;
        const redirectUrl = new URL(newPathname, `https://spmb.${baseHost}`);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
      
      if (isSpmbDomain) {
        if (pathLower === "/ppdb" || pathLower === "/spmb") {
          const redirectUrl = new URL("/", request.url);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }

        if (pathname === "/") {
          // Rewrite root of SPMB domain to /ppdb
          return NextResponse.rewrite(new URL("/ppdb", request.url));
        }
      }
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PROTECT: /dashboard/pendaftar
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname.startsWith("/dashboard/pendaftar")) {
    if (!userRole || userRole !== "pendaftar") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PROTECT: /dashboard/admin
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname.startsWith("/dashboard/admin")) {
    const allowedAdminRoles = ["admin_berkas", "admin_keuangan", "admin_super", "admin"];
    if (!userRole || !allowedAdminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PROTECT: /dashboard/penguji
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname.startsWith("/dashboard/penguji")) {
    const allowedPengujiRoles = ["penguji", "penguji_calsan", "pewawancara", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_quran", "admin_super"];
    if (!userRole || !allowedPengujiRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REDIRECT: /dashboard (root) based on role
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (userRole === "pendaftar") {
      return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "pewawancara", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_quran"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/penguji", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REDIRECT: /login if already logged in
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname === "/login" && userRole) {
    if (userRole === "pendaftar") {
      return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/penguji", request.url));
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REDIRECT: /daftar if already logged in
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (pathname.startsWith("/daftar") && userRole === "pendaftar") {
    return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
  }

  const response = NextResponse.next();

  // ══════════════════════════════════════════════════════════════════════
  // ROLLING SESSION: Automatically renew session cookie duration
  // ══════════════════════════════════════════════════════════════════════
  const rawSessionCookie = request.cookies.get("al_session");
  if (rawSessionCookie && userRole) {
    const maxAge = 60 * 60 * 24 * 90; // 90 Days
    const expires = new Date(Date.now() + maxAge * 1000);
      
    let baseDomain = "";
    if (host.includes("pesantren-alandalus-putra.com")) baseDomain = "pesantren-alandalus-putra.com";
    else if (host.includes("pesantren-alandalus-putri.com")) baseDomain = "pesantren-alandalus-putri.com";
    else if (host.includes("alandalus-ululalbaab.com")) baseDomain = "alandalus-ululalbaab.com";
    else if (host.includes("pesantren-ululalbaab.com")) baseDomain = "pesantren-ululalbaab.com";
    else if (host.includes("pesantren-alimam.com")) baseDomain = "pesantren-alimam.com";

    response.cookies.set("al_session", rawSessionCookie.value, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.startsWith("192.168."),
      sameSite: "lax",
      
      maxAge,
      expires,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


