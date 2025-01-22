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
  ThemeProvider,
  createTheme,
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

// Dark mode theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h4: {
      fontWeight: 600,
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
});

const Landing: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin: SubmitHandler<FormInputs> = async ({ email, password }) => {
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

        if (userData.role !== role) {
          toast.error(`No ${role} found.`);
          reset();
          router.push("/");
          return;
        } else {
          if (userData.role === "admin") {
            router.push("/admin");
          } else {
            dispatch(addUser(userData));
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
    <ThemeProvider theme={darkTheme}>
      <Grid 
        container 
        spacing={2} 
        justifyContent="center" 
        alignItems="center" 
        sx={{ minHeight: "100vh", bgcolor: "background.default", p: 2 }}
      >
        <ToastContainer />
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Card sx={{ boxShadow: 5, bgcolor: "background.paper", p: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom color="text.primary">
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
                  variant="outlined"
                  InputLabelProps={{ style: { color: "#b0bec5" } }}
                  InputProps={{ style: { color: "#ffffff" } }}
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
                  variant="outlined"
                  InputLabelProps={{ style: { color: "#b0bec5" } }}
                  InputProps={{ style: { color: "#ffffff" } }}
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
                  sx={{ mt: 2, fontWeight: "bold" }}
                  type="submit"
                >
                  Login
                </Button>

                {/* Toggle Role Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  sx={{ mt: 2, fontWeight: "bold" }}
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
    </ThemeProvider>
  );
};

export default Landing;
