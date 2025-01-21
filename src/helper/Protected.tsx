import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/supabase/supaClient";

interface WrapperProps {
  children: React.ReactNode;
}

const Protected: React.FC<WrapperProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);

      if (!session) {
        router.push("/");
      }
    };

    getSession();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{authenticated && children}</>;
};

export default Protected;
