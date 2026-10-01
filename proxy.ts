import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  console.log("PROXY RUNNING:", req.nextUrl.pathname);

  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("TOKEN:", token);

  const role = token?.role;

  console.log("ROLE:", role);

  if (pathname.startsWith("/login")) {
    if (role === "WARDEN") {
      return NextResponse.redirect(new URL("/warden", req.url));
    }
    if (role === "STUDENT") {
      return NextResponse.redirect(new URL("/student", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/warden")) {
    if (role !== "WARDEN") {
      return NextResponse.redirect(new URL("/login/warden", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/student")) {
    if (role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login/student", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/warden/:path*", "/student/:path*", "/login"],
};
