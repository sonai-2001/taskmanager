import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ✅ Correctly retrieve cookies (Do NOT use `await cookies()`)
    const cookieStore = cookies();

    // ✅ Create Supabase client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { access_token, refresh_token } = await req.json();

    if (!access_token || !refresh_token) {
      // ✅ Log out the user from Supabase
      await supabase.auth.signOut();

      // ✅ Create a response object
      const response = NextResponse.json({ success: true, message: "Session cleared" });

      // ✅ Use `response.cookies.delete()` to properly remove cookies
      response.cookies.delete("sb-rrtczjjjshgkrffcyiod-auth-token");
      response.cookies.delete("sb-refresh-token");

      return response;
    }

    // ✅ Store session in cookies
    await supabase.auth.setSession({ access_token, refresh_token });

    return NextResponse.json({ success: true, message: "Session stored" });
  } catch (error) {
    console.error("🔴 Error handling session:", error);
    return NextResponse.json({ error: "Failed to process session" }, { status: 500 });
  }
}
