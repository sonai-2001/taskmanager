"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/supabase/supaClient";
import { Button, CircularProgress,  Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, Grid,  Box } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useForm } from "react-hook-form";
import KanbanColumn from "@/component/KanbanColumn";

// Task type definition
interface Task {
  id: number;
  task_name: string;
  status: string;
  created_at: string;
  end_date: string;
  project_id: number;
}


const ProjectPage = () => {
  const { projectId } = useParams();  
  const [tasks, setTasks] = useState<Task[]>([]);  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");  
  const [open, setOpen] = useState<boolean>(false);  
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null); // Store task ID for editing

  const { register, handleSubmit, reset, formState: { errors }, setValue,watch } = useForm({
    defaultValues: {
      task_name: "",
      end_date: "",
      status: "",  // Default empty, will be set when editing
    },
  });

  const router=useRouter()

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error fetching tasks.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (data: { task_name: string; end_date: string }) => {
    const { task_name, end_date } = data;
  
    if (!task_name || !end_date) {
      setError("Please fill in all the fields.");
      return;
    }
  
    // Handle projectId type
    const projectIdStr = Array.isArray(projectId) ? projectId[0] : projectId || '';
  
    if (!projectIdStr) {
      toast.error("Invalid project ID.");
      return;
    }
  
    try {
      const { data: existingTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", parseInt(projectIdStr, 10))
        .eq("task_name", task_name);
  
      if (fetchError) throw fetchError;
  
      if (existingTasks && existingTasks.length > 0) {
        toast.error("A task with the same name already exists.");
        return; // Avoid updating state here
      }
  
      const { data: insertedData, error: insertError } = await supabase
        .from("tasks")
        .insert([
          {
            task_name: task_name,
            end_date: end_date,
            project_id: parseInt(projectIdStr, 10),
          },
        ])
        .select();
  
      if (insertError) throw insertError;
  
      setTasks((prevTasks) => [...prevTasks, ...(insertedData || [])]);
      setOpen(false);
      reset();
      setError(""); 
      toast.success("Task added successfully!", { autoClose: 3000 });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to add task.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDrop =async (taskId:number, newStatus:string) => {
    try {
      const { error } = await supabase
    .from("tasks")  // Replace with your actual table name
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    throw error.message
  } else {
    console.log(`Task ${taskId} updated successfully in Supabase`);
  }
    
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    } catch (error) {
        toast.error(`Failed to update task status: ${error}`);
    }
  };
  
  

  // Handle Edit Task
  const handleEditTask = async (data: { task_name: string; end_date: string; status: string }) => {
    const { task_name, end_date, status } = data;
  
    if (!task_name || !end_date) {
      toast.error("Please fill in all the fields.", { autoClose: 3000 });
      return;
    }
  
    try {
      // Fetch the project ID related to the task being edited
      const { data: taskData, error: fetchError } = await supabase
        .from("tasks")
        .select("project_id")
        .eq("id", editingTaskId)
        .single();
  
      if (fetchError) throw fetchError;
  
      const projectId = taskData?.project_id;
  
      if (!projectId) {
        toast.error("Project not found.", { autoClose: 3000 });
        return;
      }
  
      // Check if another task with the same name exists in the project
      const { data: existingTasks, error: checkError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId)
        .eq("task_name", task_name)
        .neq("id", editingTaskId);
  
      if (checkError) throw checkError;
  
      if (existingTasks && existingTasks.length > 0) {
        toast.error("Task name already exists in this project.", { autoClose: 3000 });
        return;
      }
  
      // Proceed with updating the task
      const { error } = await supabase
        .from("tasks")
        .update({ task_name, end_date, status })
        .eq("id", editingTaskId);
  
      if (error) throw error;
  
      // Update tasks in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTaskId ? { ...task, task_name, end_date, status } : task
        )
      );
  
      setOpen(false);
      reset();
      toast.success("Task updated successfully!", { autoClose: 3000 });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to update task.", { autoClose: 3000 });
      } else {
        toast.error("An unexpected error occurred.", { autoClose: 3000 });
      }
    }
  };
  
  

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setValue("task_name", task.task_name);
    setValue("end_date", task.end_date);
    setValue("status", task.status);
    setOpen(true);
  };
  

  // Handle Delete Task
  const handleDeleteTask = async (taskId: number) => {
    try {
      // Attempt to delete the task from the database
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
  
      // Remove the deleted task from the state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!", { autoClose: 3000 });
    } catch (err: unknown) {
      // Handle errors with type safety
      if (err instanceof Error) {
        toast.error(err.message || "Failed to delete task.", { autoClose: 3000 });
      } else {
        toast.error("An unexpected error occurred.", { autoClose: 3000 });
      }
    }
  };
  
  // const cardStyle = {
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "space-between",
  //   minHeight: "150px",
  //   boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  //   borderRadius: "8px",
  // };
  

  return (
    <Box 
  sx={{
    width: '100vw', // Full screen width
    // Full screen height
    minHeight:'100vh',
    backgroundColor: '#121212', // Dark background
    color: '#e0e0e0', // Light text color
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px'
  }}
>
  <ToastContainer 
    autoClose={3000} 
    position="top-right" 
    hideProgressBar={true} 
    closeButton={false} 
    pauseOnHover={true} 
  />

  <Typography variant="h4" gutterBottom>
    Project Details
  </Typography>
  <Typography variant="h6" gutterBottom>
    Project ID: {projectId}
  </Typography>

  <Button
    variant="contained"
    color="secondary"
    sx={{ marginBottom: "20px" }}
    onClick={() => {
      setOpen(true);
      setEditingTaskId(null); // Clear editing task when adding new task
    }}
  >
    Add Task
  </Button>

  <Button
  variant="contained"
  color="secondary"
  onClick={() => router.back()} // Use router.back() to navigate back to the previous page
  sx={{
    position: "absolute",
    top: 50, // Adjust as needed
    left: {
      xs: 8,    // Smaller left position for extra small screens
      sm: 12,   // Slightly larger left for small screens
      md: 20,   // Larger left position for medium and bigger screens
    },
    backgroundColor: "#333",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#555",
    },
    padding: {
      xs: "8px 16px",  // Small padding on extra small screens
      sm: "10px 20px", // Medium padding on small screens
      md: "12px 24px", // Larger padding on medium screens
    },
    fontSize: {
      xs: "0.75rem",   // Smaller text on extra small screens
      sm: "1rem",      // Standard text on small screens
      md: "1.2rem",    // Larger text on medium screens
    },
  }}
>
  Back
</Button>


  
 

  {loading ? (
    <CircularProgress />
  ) : error ? (
    <Typography color="error">{error}</Typography>
  ) : tasks.length > 0 ? (
    <DndProvider backend={HTML5Backend}>
      <Grid
        container
        spacing={3}
        sx={{ padding: 2 }}
        justifyContent="center"
        alignItems="flex-start"
      >
        <KanbanColumn
          title="To Do"
          status="To-Do"
          tasks={tasks}
          onDrop={handleDrop}
          edit={handleEditClick}
          handleDelete={handleDeleteTask}
        />
        <KanbanColumn
          title="In Progress"
          status="In-Progress"
          tasks={tasks}
          onDrop={handleDrop}
          edit={handleEditClick}
          handleDelete={handleDeleteTask}
        />
        <KanbanColumn
          title="Completed"
          status="Completed"
          tasks={tasks}
          onDrop={handleDrop}
          edit={handleEditClick}
          handleDelete={handleDeleteTask}
        />
      </Grid>
    </DndProvider>
  ) : (
    <Typography>No tasks found for this project.</Typography>
  )}

  {/* Add/Edit Task Modal */}
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>{editingTaskId ? "Edit Task" : "Add New Task"}</DialogTitle>
    <DialogContent>
      <form onSubmit={handleSubmit(editingTaskId ? handleEditTask : handleAddTask)} id="taskForm">
        <TextField
          label="Task Name"
          fullWidth
          {...register("task_name", { required: "Task name is required" })}
          margin="normal"
          error={!!errors.task_name}
          helperText={errors.task_name?.message}
        />
        <TextField
          label="End Date"
          fullWidth
          type="date"
          {...register("end_date", { required: "End date is required" })}
          margin="normal"
          error={!!errors.end_date}
          helperText={errors.end_date?.message}
          InputLabelProps={{
            shrink: true,
          }}
        />
       { !editingTaskId &&  
  <Select
    label="Status"
    fullWidth
    {...register("status", { required: "Status is required" })}
    margin="none"  
    error={!!errors.status}
    displayEmpty
    value={watch("status") || ""}  // Watch the value of the 'status' field or set default empty value
  >
    <MenuItem value="">
      <em>None</em>
    </MenuItem>
    <MenuItem value="To-Do">To-Do</MenuItem>
    <MenuItem value="In-Progress">In-Progress</MenuItem>
    <MenuItem value="Completed">Completed</MenuItem>
  </Select>
}

        {error && <Typography color="error">{error}</Typography>}
      </form>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)} color="secondary">
        Cancel
      </Button>
      <Button type="submit" form="taskForm" color="primary">
        {editingTaskId ? "Update Task" : "Add Task"}
      </Button>
    </DialogActions>
  </Dialog>
</Box>
  );
};

export default ProjectPage;
