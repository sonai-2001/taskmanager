"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import supabase from "../supabase/supaClient";
import { useAppDispatch } from "@/hooks/redux/page";
import { addUser } from "@/redux-toolkit/slice/userSlice";

interface FormInputs {
  email: string;
  password: string;
}

const Landing: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Toggle between admin and user login
  const router = useRouter();
  const dispatch=useAppDispatch()

  // Handle login
  const handleLogin: SubmitHandler<FormInputs> = async ({ email, password }: FormInputs) => {
    const role = isAdmin ? "admin" : "user";
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .single();

        if (userError) throw userError;

        // Store user data in sessionStorage
        // sessionStorage.setItem("user", JSON.stringify(userData));

        // Compare the role from the toggle with the database
        if (userData.role !== role) {
          toast.error(`No ${role} found.`);
          reset();
          router.push("/"); // Redirect to the home or login page
          return;
        } else {
          // Redirect to the appropriate page based on the role
          if (userData.role === "admin") {
            router.push("/admin");
          } else {
            console.log("the userdata is",userData)

             dispatch(addUser(userData))
            router.push("/user");
          }
        }

        toast.success("Login successful!", { position: "top-center" });
        reset();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
      <ToastContainer />
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Login as {isAdmin ? "Admin" : "User"}
            </Typography>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ mt: 2 }}
              onSubmit={handleSubmit(handleLogin)}
            >
              {/* Email */}
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

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 6, message: "Password must be at least 6 characters." },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                type="submit"
              >
                Login
              </Button>

              {/* Toggle Role Button */}
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={() => setIsAdmin((prev) => !prev)}
              >
                Switch to {isAdmin ? "User" : "Admin"} Mode
              </Button>

              {/* Error Message */}
              {errorMessage && (
                <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Landing;
