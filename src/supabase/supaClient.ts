import { createClient } from "@supabase/supabase-js";





const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
// const projectUrl = "https://rrtczjjjshgkrffcyiod.supabase.co";
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
// const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydGN6ampqc2hna3JmZmN5aW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA5NDM2NywiZXhwIjoyMDUyNjcwMzY3fQ.7tVQ0dryGMGTBSAxZa5m7Gm0zl-YEmMrO8vgvd2PBkQ";

console.log("projectUrl",projectUrl)
console.log("projectkey",apiKey)
if (!projectUrl || !apiKey) {
  throw new Error("Missing Supabase URL or API Key in environment variables.");
}

console.log("the project url is: " + projectUrl);
const supabase=createClient(projectUrl,apiKey)





export default supabase;