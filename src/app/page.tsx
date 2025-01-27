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
  CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import supabase from "../supabase/supaClient";
import { useAppDispatch } from "@/hooks/redux/page";
import { addUser } from "@/redux-toolkit/slice/userSlice";
import { darkTheme } from "@/helper/theme";

interface FormInputs {
  email: string;
  password: string;
  display_name?: string;
}

// Dark mode theme
// const darkTheme = createTheme({
//   palette: {
//     mode: "dark",
//     background: {
//       default: "#121212",
//       paper: "#1E1E1E",
//     },
//     primary: {
//       main: "#90caf9",
//     },
//     secondary: {
//       main: "#f48fb1",
//     },
//     text: {
//       primary: "#ffffff",
//       secondary: "#b0bec5",
//     },
//   },
//   typography: {
//     fontFamily: "Arial, sans-serif",
//     h4: {
//       fontWeight: 600,
//     },
//     body2: {
//       fontSize: "0.875rem",
//     },
//   },
// });

const Landing: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  //  handle login code
  const handleLogin: SubmitHandler<FormInputs> = async ({
    email,
    password,
  }) => {
    const role = isAdmin ? "admin" : "user";
    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
       console.log("the data is",DataView)
      if (data) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id",data.user.id)
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
            const {data:taskableUser,error:taskableUserError}=await supabase.from("taskusers")
            .select("*")
            .eq("id",userData.id)
           console.log("taskable user",taskableUser)
            if(taskableUserError){
                throw taskableUserError
            }
            if(taskableUser.length>0){
              router.push("/user");

            }else{
              router.push("/normaluser")
            }

          }
        }
        setLoading(false); // Stop loading when user is authenticated
        toast.success("Login successful!", { position: "top-center" });
        reset();
      }
    } catch (error: unknown) {
      setLoading(false)
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };
 
  // handle register code
  const handleRegister: SubmitHandler<FormInputs> = async ({
    email,
    password,
    display_name,
  }) => {
    setErrorMessage("");
    setLoading(true); // Start loading when adding a user
    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: display_name || "" },
          },
        });

      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("User ID not found during sign-up.");
       const role=isAdmin?"admin":"user"
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ id: userId, email, display_name, role:role  }]);

      if (insertError) throw insertError;

      // const { error: insert2Error } = await supabase.from("taskusers").insert([
      //   { id: userId, email, display_name, role: "user" },
      // ]);

      // if (insert2Error) throw insert2Error;

      // setUsers([...users, { id: userId, email, display_name }]);
      setLoading(false);
      setIsLogin(true);
      toast.success("Sign-up successful!", { position: "top-center" });
      reset();
      // setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
        setErrorMessage(error.message);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false); // Stop loading after form submission
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
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Card
              sx={{
                boxShadow: 5,
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  align="center"
                  gutterBottom
                  color="text.primary"
                >
                  {isLogin ? "Login" : "Register"} as{" "}
                  {isAdmin ? "Admin" : "User"}
                </Typography>
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  sx={{ mt: 2 }}
                  onSubmit={handleSubmit(
                    isLogin ? handleLogin : handleRegister
                  )}
                >
                  {/* user name */}
                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Username"
                      margin="normal"
                      {...register("display_name", {
                        required: "Username is required.",
                      })}
                      error={!!errors.display_name}
                      helperText={errors.display_name?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
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
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters.",
                      },
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
                    {isLogin ? "Login" : "Register"}
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

                  <Typography
                    onClick={() => setIsLogin((prev) => !prev)}
                    variant="body2"
                    color="success"
                    align="center"
                    sx={{ mt: 2, cursor: "pointer" }}
                  >
                    {isLogin
                      ? "new user? go to Register"
                      : "Already have an account?Login "}
                  </Typography>

                  {/* Error Message */}
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
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </ThemeProvider>
  );
};

export default Landing;
