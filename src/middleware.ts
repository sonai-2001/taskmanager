import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  console.log("🔹 Middleware Executing...");

  const supabase = createMiddlewareClient({ req, res });

  // ✅ Get user session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user || null;

  console.log("🔹 User in Middleware:", user);
  console.log("🔹 Session Error (if any):", sessionError);

  const pathname = req.nextUrl.pathname;

  // ✅ Prevent logged-in users from visiting the login page ("/")
  if (user && pathname === "/") {
    console.log("🔴 User already logged in, redirecting to their dashboard.");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, added_taskable")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("🔴 User data fetch error:", userError);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    console.log("✅ User role and taskable status detected:", userData);

    // Redirect based on user role and added_taskable
    if (userData.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (userData.role === "user") {
      if (userData.added_taskable) {
        return NextResponse.redirect(new URL("/user", req.url)); // Redirect if taskable
      } else {
        return NextResponse.redirect(new URL("/normaluser", req.url)); // Redirect if not taskable
      }
    }

    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Allow public routes without authentication
  const publicRoutes = ["/"];

  if (!user) {
    if (publicRoutes.includes(pathname)) {
      console.log("✅ Public route accessed, no redirect needed.");
      return res;
    }

    console.log("🔴 No user detected, redirecting to login.");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Fetch user data (including role and added_taskable)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, added_taskable")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    console.error("🔴 User data fetch error:", userError);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  console.log("✅ User role and taskable status detected:", userData);

  // ✅ Role-based access control
  if (userData.role === "admin" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Check if user is taskable or not, and restrict access to appropriate route
  if (userData.role === "user") {
    if (userData.added_taskable && !pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (!userData.added_taskable && !pathname.startsWith("/normaluser")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return res;
}

// ✅ Apply middleware only to protected routes
export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/normaluser/:path*"],
};
