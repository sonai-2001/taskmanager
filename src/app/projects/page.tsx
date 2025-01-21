"use client";
import React, { useEffect, useState } from "react";
import supabase from "../../supabase/supaClient";
import Protected from "@/helper/Protected";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Retrieve userId from sessionStorage
  const user = sessionStorage.getItem("user");
  let userId: string | null = null;

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      userId = parsedUser.id;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  // Handle sign-out
  

  // Fetch projects
  useEffect(() => {
    if (!userId) {
      setFetchError("User ID not found. Please log in.");
      return;
    }

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        setProjects(data|| [] );
      } catch (error: any) {
        setFetchError(error.message);
      }
    };

    fetchProjects();
  }, [userId]);

  return (
    <Protected>
      <div>
       

        {/* Display error or projects */}
        {fetchError ? (
          <p style={{ color: "red" }}>{fetchError}</p>
        ) : (
          <ul>
            {projects.map((project: any) => (
              <li key={project.id}>{project.project_name}</li>
            ))}
          </ul>
        )}
      </div>
    </Protected>
  );
};

export default Projects;
