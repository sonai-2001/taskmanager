import { createClient } from "@supabase/supabase-js";

// const projectUrl="https://rrtczjjjshgkrffcyiod.supabase.co";
const apiKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydGN6ampqc2hna3JmZmN5aW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwOTQzNjcsImV4cCI6MjA1MjY3MDM2N30.lRFq5EYdHdNi_23wSftaZ7QfEjUEP7l8M9xFn6HGWOA"
// const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydGN6ampqc2hna3JmZmN5aW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA5NDM2NywiZXhwIjoyMDUyNjcwMzY3fQ.7tVQ0dryGMGTBSAxZa5m7Gm0zl-YEmMrO8vgvd2PBkQ"


// const projectUrl = process.env.SUPABASE_URL;
const projectUrl="https://rrtczjjjshgkrffcyiod.supabase.co";


// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydGN6ampqc2hna3JmZmN5aW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA5NDM2NywiZXhwIjoyMDUyNjcwMzY3fQ.7tVQ0dryGMGTBSAxZa5m7Gm0zl-YEmMrO8vgvd2PBkQ";
console.log("the project url is: " + projectUrl);
const supabase=createClient(projectUrl,apiKey)

// Ensure environment variables are available
if (!projectUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
}

export const supabaseAdmin = createClient(projectUrl, supabaseServiceRoleKey);


export default supabase;