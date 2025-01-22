"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/supabase/supaClient";
import { Button, CircularProgress, List, ListItem, ListItemText, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

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
    } catch (err: any) {
      setError(err.message || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new task
  const handleAddTask = async (data: { task_name: string; end_date: string }) => {
    const { task_name, end_date } = data;

    if (!task_name || !end_date) {
      setError("Please fill in all the fields.");
      return;
    }

    try {
      const { data: existingTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", parseInt(projectId))
        .eq("task_name", task_name);

      if (fetchError) throw fetchError;

      if (existingTasks.length > 0) {
        setError("A task with the same name already exists.");
        return;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("tasks")
        .insert([{
          task_name: task_name,
          end_date: end_date,
          project_id: parseInt(projectId),
        }])
        .select();

      if (insertError) throw insertError;

      setTasks([...tasks, ...insertedData]);
      setOpen(false);
      reset();
      setError("");
      toast.success("Task added successfully!", { autoClose: 3000 });
    } catch (err: any) {
      setError(err.message || "Failed to add task.");
    }
  };

  // Handle Edit Task
  const handleEditTask = async (data: { task_name: string; end_date: string; status: string }) => {
    const { task_name, end_date, status } = data;
    if (!task_name || !end_date) {
      setError("Please fill in all the fields.");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ task_name, end_date, status })
        .eq("id", editingTaskId); // Update the task by ID

      if (error) throw error;

      // Update tasks in the local state
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? { ...task, task_name, end_date, status } : task
      ));

      setOpen(false);
      reset();
      setError("");
      toast.success("Task updated successfully!", { autoClose: 3000 });
    } catch (err: any) {
      setError(err.message || "Failed to update task.");
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;

      // Remove the deleted task from the state
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!", { autoClose: 3000 });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Project Details
      </Typography>
      <Typography variant="h6" gutterBottom>
        Project ID: {projectId}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        style={{ marginBottom: "20px" }}
        onClick={() => {
          setOpen(true);
          setEditingTaskId(null); // Clear editing task when adding new task
        }}
      >
        Add Task
      </Button>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : tasks.length > 0 ? (
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} divider>
              <ListItemText
                primary={task.task_name}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
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
                      }).format(new Date(task.created_at))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      End Date:{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(task.end_date))}
                    </Typography>
                  </>
                }
              />
             <Button
  size="small"
  color="primary"
  onClick={() => {
    setEditingTaskId(task.id); // Set task ID for editing
    setValue("task_name", task.task_name);  // Pre-fill task name
    setValue("end_date", task.end_date);  // Pre-fill end date
    setValue("status", task.status);  // Pre-fill status with the existing value
    setOpen(true); // Open modal for editing
  }}
>
  Edit
</Button>

              <Button
                size="small"
                color="secondary"
                onClick={() => handleDeleteTask(task.id)} // Handle delete task
              >
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
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
          { editingTaskId &&   <Select
  label="Status"
  fullWidth
  {...register("status", { required: "Status is required" })}
  margin="normal"
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
</Select>}

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
    </div>
  );
};

export default ProjectPage;
