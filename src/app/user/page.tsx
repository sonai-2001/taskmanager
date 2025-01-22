"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import supabase from "@/supabase/supaClient";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "@/hooks/redux/page";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Protected from "@/helper/Protected";

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
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
  const { user } = useAppSelector((store) => store.user);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, created_at, project_name")
        .eq("user_id", user.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to add a project
  const onSubmit: SubmitHandler<FormInputs> = async ({ project_name }) => {
    setErrorMessage("");
    try {
      // Check if project with the same name exists for the user
      const { data: existingProject, error: fetchError } = await supabase
        .from("projects")
        .select("id")
        .eq("project_name", project_name)
        .eq("user_id", user.id)
        .single();
  
      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError; // Throw error if it's not a "No rows found" error
      }
  
      if (existingProject) {
        toast.error("A project with this name already exists.", { autoClose: 3000 });
        return;
      }
  
      // Insert new project if no duplicate found
      const { data: newProject, error: insertError } = await supabase
        .from("projects")
        .insert([{ project_name: project_name, user_id: user.id }])
        .select()
        .single();
  
      if (insertError) throw insertError;
  
      setProjects([...projects, newProject]);
      toast.success("Project added successfully!", { autoClose: 3000 });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to add project: " + error.message, { autoClose: 3000 });
    }
  };
  

  // Handle project deletion
  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .match({ id: projectId });

      if (deleteError) throw deleteError;

      setProjects(projects.filter((project) => project.id !== projectId));
      toast.success("Project deleted successfully!", { autoClose: 3000 });
    } catch (error: any) {
      toast.error("Failed to delete project: " + error.message, { autoClose: 3000 });
    }
  };

  if (user) {
    return (
      <Protected>

<Box sx={{ textAlign: "center", mt: 4 }}>
        <ToastContainer />

        <Typography variant="h4" gutterBottom>
          {user.display_name} Projects
        </Typography>

        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add Project
        </Button>

        <Box mt={4}>
          <Typography variant="h6">Project List</Typography>
          {loading ? (
            <CircularProgress />
          ) : projects.length > 0 ? (
            <List>
              {projects.map((project) => (
               <ListItem key={project.id} divider>
               <ListItemText
                 primary={
                   <Link href={`/user/${project.id}`} passHref>
                     <Typography 
                       variant="body1" 
                       component="a" 
                       sx={{ color: "blue", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                     >
                       {project.project_name}
                     </Typography>
                   </Link>
                 }
                 secondary={`Created at: ${new Intl.DateTimeFormat("en-IN", {
                   day: "2-digit",
                   month: "2-digit",
                   year: "numeric",
                   hour: "2-digit",
                   minute: "2-digit",
                   second: "2-digit",
                   hour12: true,
                   timeZone: "Asia/Kolkata",
                 }).format(new Date(project.created_at))}`}
               />
               <IconButton onClick={() => handleDeleteProject(project.id)} color="error">
                 <DeleteIcon />
               </IconButton>
             </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No projects found.</Typography>
          )}
        </Box>

        <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="modal-title">
          <Box sx={modalStyle}>
            <Typography id="modal-title" variant="h6" gutterBottom>
              Add New Project
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Project name"
                margin="normal"
                {...register("project_name", { required: "Project name is required." })}
                error={!!errors.project_name}
                helperText={errors.project_name?.message}
              />

              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Add
              </Button>
              <Button onClick={() => setOpen(false)} variant="outlined" sx={{ mt: 2, ml: 2 }}>
                Cancel
              </Button>
            </form>

            {errorMessage && (
              <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </Box>
        </Modal>
      </Box>
      </Protected>
    );
  } else {
    router.push("/");
    return null;
  }
};

export default UserPage;
