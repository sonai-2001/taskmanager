import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  console.log("Path:", path);

  // ✅ Ensure Supabase environment variables are loaded
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("🚨 Supabase environment variables are missing!");
    return NextResponse.error();
  }

  // ✅ Create Supabase client
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Fetch user session
  const { data: { user } } = await supabase.auth.getUser();
  console.log("User:", user);

  // 🚨 If user is NOT logged in, allow only the login page
//   if (!user) {
//     if (path === "/") {
//       return res; // Let them access the login page
//     }
//     return NextResponse.redirect(new URL("/", req.url)); // Redirect to login
//   }

  // ✅ Fetch user role from Supabase
//   const { data: userData, error } = await supabase
//     .from("users")
//     .select("role, added_taskable")
//     .eq("id", user.id)
//     .single();

//   console.log("User Data:", userData);

  // 🚨 If user data is missing, redirect to login
//   if (!userData || error) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   const { role, added_taskable } = userData;

  // ✅ Define allowed routes based on user role
//   const roleAccess: Record<string, string[]> = {
//     admin: ["/admin"],
//     user: added_taskable ? ["/user"] : ["/normaluser"],
//   };

//   const allowedPaths = roleAccess[role] || [];

  // 🚨 If user tries to access an unauthorized route, redirect them
//   if (!allowedPaths.some((p) => path.startsWith(p))) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

  return res; // ✅ Allow access
}

export const config = {
  matcher: ["/admin", "/user/:path*", "/normaluser/:path*", "/"], // Apply middleware to these routes
};
