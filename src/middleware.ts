import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName:
            process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
    });

    const { pathname } = request.nextUrl;

    // 1. Already logged in → don't show login page again
    if (token && pathname.startsWith("/signIn")) {
        return NextResponse.redirect(new URL("/Home", request.url));
    }

    // 2. Not logged in → send to login
    if (!token && !pathname.startsWith("/signIn")) {
        return NextResponse.redirect(new URL("/signIn", request.url));
    }

    // 3. Role-based route protection
    const role = token?.role as string;

    if (pathname.startsWith("/employee") && role !== "employee") {
        return NextResponse.redirect(new URL("/Home", request.url));
    }

    if (pathname.startsWith("/manager") && role !== "manager") {
        return NextResponse.redirect(new URL("/Home", request.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/Home", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/signIn",
        "/signUp",
        "/employee/:path*",
        "/manager/:path*",
        "/admin/:path*",
    ],
};