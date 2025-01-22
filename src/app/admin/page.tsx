"use client"
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
import { toast } from "react-toastify";
import supabase from "@/supabase/supaClient";
import DeleteIcon from "@mui/icons-material/Delete";
import Protected from "@/helper/Protected";

// Define form input types
interface FormInputs {
  username: string;
  email: string;
  password: string;
  display_name: string;
}

// User data type
interface User {
  id: string;
  email: string;
  display_name: string;
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

const AdminPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);  // Loading state for actions
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true); // Start loading while fetching users
    try {
      const { data, error } = await supabase.from("taskusers").select("id, email, display_name");
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
    } finally {
      setLoading(false); // Stop loading after fetching users
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = async ({ email, password, display_name }) => {
    setErrorMessage('');
    setLoading(true); // Start loading when adding a user
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: display_name || '' },
        },
      });

      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("User ID not found during sign-up.");

      const { error: insertError } = await supabase.from("users").insert([
        { id: userId, email, display_name, role: "user" },
      ]);

      if (insertError) throw insertError;

      const { error: insert2Error } = await supabase.from("taskusers").insert([
        { id: userId, email, display_name, role: "user" },
      ]);

      if (insert2Error) throw insert2Error;

      setUsers([...users, { id: userId, email, display_name }]);
      toast.success("Sign-up successful!", { position: "top-center" });
      reset();
      setOpen(false);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false); // Stop loading after form submission
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    setLoading(true); // Start loading when deleting user

    try {
      // Delete user from taskusers table
      const { error: taskUserError } = await supabase.from("taskusers").delete().match({ id: userId });
      if (taskUserError) throw taskUserError;

      // Delete user from users table
      const { error: usersError } = await supabase.from("users").delete().match({ id: userId });
      if (usersError) throw usersError;

      // Delete user from Supabase authentication
      const response = await fetch(`/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to delete user");

      // Update local state to remove the user
      setUsers(users.filter(user => user.id !== userId));
      toast.success("User deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    } finally {
      setLoading(false); // Stop loading after deletion
    }
  };

  return (
  <Protected>
      <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add User
      </Button>

      <Box mt={4}>
        <Typography variant="h6">User List</Typography>
        {loading ? (
          <CircularProgress />
        ) : users.length > 0 ? (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText primary={user.display_name} secondary={user.email} />
                <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No users found.</Typography>
        )}
      </Box>

      <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="modal-title">
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" gutterBottom>
            Add New User
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...register("display_name", { required: "Username is required." })}
              error={!!errors.display_name}
              helperText={errors.display_name?.message}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long.",
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
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
};

export default AdminPage;


