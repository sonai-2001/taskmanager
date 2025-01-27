import { createClient } from "@supabase/supabase-js";





const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string | undefined;
if (!projectUrl || !apiKey) {
  throw new Error("Missing Supabase URL or API Key in environment variables.");
}

console.log("the project url is: " + projectUrl);
const supabase=createClient(projectUrl,apiKey)





export default supabase;