"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import supabase from "@/supabase/supaClient";
import DeleteIcon from "@mui/icons-material/Delete";
// import { useAppSelector } from "@/hooks/redux/page";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

// Define form input types
interface FormInputs {
  project_name: string;
}

// Project data type
interface Project {
  id: number;
  created_at: string;
  project_name: string;
}
interface User {
  id: string;
  created_at: string;
  email: string;
}

// Modal style
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const UserPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection,setActiveSection] = useState("projects")
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>();
  // const { user } = useAppSelector((store) => store.user);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
     if(session?.user){
      setUser({
        email:session.user.email || "",
        id: session.user.id,
        created_at:session.user.created_at || ""
      });
     }else{
       setUser(null);
     }

      const { data, error } = await supabase
        .from("projects")
        .select("id, created_at, project_name")
        .eq("user_id", session?.user?.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching projects:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async ({ project_name }) => {
    setErrorMessage("");
    try {
      const { data: existingProject, error: fetchError } = await supabase
        .from("projects")
        .select("id")
        .eq("project_name", project_name)
        .eq("user_id", user?.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingProject) {
        toast.error("A project with this name already exists.", {
          autoClose: 3000,
        });
        return;
      }

      const { data: newProject, error: insertError } = await supabase
        .from("projects")
        .insert([{ project_name: project_name, user_id: user?.id }])
        .select()
        .single();

      if (insertError) throw insertError;

      setProjects((prevProjects) => [...prevProjects, newProject]);
      toast.success("Project added successfully!", { autoClose: 3000 });
      reset();
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to add project: " + error.message, {
          autoClose: 3000,
        });
      } else {
        toast.error("An unexpected error occurred", { autoClose: 3000 });
      }
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .match({ id: projectId });

      if (deleteError) throw deleteError;

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      toast.success("Project deleted successfully!", { autoClose: 3000 });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to delete project: " + error.message, {
          autoClose: 3000,
        });
      } else {
        toast.error("An unexpected error occurred", { autoClose: 3000 });
      }
    }
  };

  const isDarkMode = true;

  if (user) {
    return (
      <Box
  sx={{
    display: "flex",
    flexDirection: "row",
    bgcolor: isDarkMode ? "#121212" : "#f4f6f9",
    minHeight: "100vh",
  }}
>
  {/* Sidebar */}
  <Box
    sx={{
      width: "250px",
      bgcolor: isDarkMode ? "#333" : "#fff",
      boxShadow: 2,
      padding: 3,
      display: "flex",
      flexDirection: "column",
      justifyContent: "start",
      minHeight: "100vh",
    }}
  >
    <Typography
      variant="h5"
      sx={{
        color: isDarkMode ? "#fff" : "#333",
        fontWeight: "bold",
        marginBottom: 3,
      }}
    >
     Menu
    </Typography>
  
    {/* Navigation Buttons */}
    <Button
      variant="contained"
      sx={{
        mb: 2,
        bgcolor: isDarkMode ? "#444" : "#1976d2",
        color: "#fff",
        "&:hover": { bgcolor: isDarkMode ? "#555" : "#1565c0" },
      }}
      onClick={() => setActiveSection("details")}
    >
      My Details
    </Button>
  
    <Button
      variant="contained"
      sx={{
        bgcolor: isDarkMode ? "#444" : "#1976d2",
        color: "#fff",
        "&:hover": { bgcolor: isDarkMode ? "#555" : "#1565c0" },
      }}
      onClick={() => setActiveSection("projects")}
    >
      My Projects
    </Button>
  </Box>
{
  activeSection==="projects" ?(
    <Box
    sx={{
      flex: 1,
      padding: 3,
      bgcolor: isDarkMode ? "#121212" : "#fff",
    }}
  >
    <ToastContainer />
    
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: isDarkMode ? "#fff" : "#333",
          fontWeight: "bold",
        }}
      >
        User Dashboard
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: isDarkMode ? "#1d1d1d" : "#1976d2",
          color: "#fff",
          "&:hover": {
            backgroundColor: isDarkMode ? "#333" : "#1565c0",
          },
        }}
      >
        Add Project
      </Button>
    </Box>

   
   {/* Project Count Board */}
<Box
  sx={{
    bgcolor: isDarkMode ? "#333" : "#1976d2",
    color: "#fff",
    padding: 2,
    borderRadius: 2,
    mb: 3,
    boxShadow: 2,
    width: "100%", // Make the box take full width
    maxWidth: 350, // Set a maximum width to maintain a nice proportion
    height: 100,  // Adjust the height to be more rectangular
    display: "flex",
    justifyContent: "center", // Center content horizontally
    alignItems: "center",     // Center content vertically
  }}
>
  <Typography variant="h6">Total Projects: {projects.length}</Typography>
</Box>



    {/* Project List */}
    <Typography variant="h5" sx={{ mb: 3,color:"#fff" }}>
      Project List
    </Typography>
    
    {loading ? (
      <CircularProgress />
    ) : projects.length > 0 ? (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
        }}
      >
        {projects.map((project) => (
          <Box
            key={project.id}
            sx={{
              backgroundColor: isDarkMode ? "#1d1d1d" : "#fff",
              borderRadius: 2,
              boxShadow: 3,
              padding: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link href={`/user/${project.id}`} passHref>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? "#bb86fc" : "#1976d2",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {project.project_name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode ? "#bbb" : "#666",
                    mt: 1,
                    mb: 1,
                  }}
                >
                  Created at:{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(project.created_at))}
                </Typography>
              </Box>
            </Link>
            <IconButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent the link click event from firing
                handleDeleteProject(project.id);
              }}
              color="error"
              sx={{ alignSelf: "flex-end" }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    ) : (
      <Typography>No projects found.</Typography>
    )}

    {/* Add Project Modal */}
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-title"
    >
      <Box sx={{ ...modalStyle, bgcolor: isDarkMode ? "#333" : "#fff" }}>
        <Typography
          id="modal-title"
          variant="h6"
          gutterBottom
          sx={{ color: isDarkMode ? "#fff" : "#000" }}
        >
          Add New Project
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Project name"
            margin="normal"
            {...register("project_name", {
              required: "Project name is required.",
            })}
            error={!!errors.project_name}
            helperText={errors.project_name?.message}
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: isDarkMode ? "#555" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              backgroundColor: isDarkMode ? "#1d1d1d" : "#1976d2",
              color: isDarkMode ? "#fff" : "#000",
            }}
          >
            Add
          </Button>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{
              mt: 2,
              ml: 2,
              color: isDarkMode ? "#bbb" : "#000",
              borderColor: isDarkMode ? "#bbb" : "#000",
            }}
          >
            Cancel
          </Button>
        </form>

        {errorMessage && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mt: 2 }}
          >
            {errorMessage}
          </Typography>
        )}
      </Box>
    </Modal>
  </Box>
  ):(
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start", // Align content to the left
      gap: 3,
      ml: 4, // Added left margin
    }}
  >
    {/* Header */}
    <Typography
      variant="h4"
      sx={{ color: isDarkMode ? "#fff" : "#333", fontWeight: "bold" }}
    >
      My Details
    </Typography>
  
    {/* User Info Card */}
    <Box
      sx={{
        bgcolor: isDarkMode ? "#1d1d1d" : "#fff",
        color: isDarkMode ? "#fff" : "#333",
        padding: 4, // Increased padding
        borderRadius: 2,
        boxShadow: 3,
        width: "100%",
        maxWidth: 600, // Increased width
      }}
    >
      
      <Typography variant="h6">Email: {user?.email || "N/A"}</Typography>
      <Typography variant="h6">
        Joined:{" "}
        {new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(user?.created_at))}
      </Typography>
    </Box>
  </Box>
  
  
  )
}


  
</Box>

    
    
    );
  } else {
    return null;
  }
};

export default UserPage;
