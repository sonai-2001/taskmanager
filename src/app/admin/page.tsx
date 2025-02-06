"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  // IconButton,
  ThemeProvider,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { toast } from "react-toastify";
import supabase from "@/supabase/supaClient";
// import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation"; // Import useRouter
import { darkTheme } from "@/helper/theme";
import TaskableUsers from "@/component/TaskableUsers";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/page";
import { addTaskableUsers, setUsers } from "@/redux-toolkit/slice/adminSlice";

// Define form input types
// interface FormInputs {
//   username: string;
//   email: string;
//   password: string;
//   display_name: string;
// }

// User data type
interface User {
  id: string;
  email: string;
  display_name: string;
  added_taskable: boolean;
}

interface admin {
  id: string;
  created_at: string;
  email: string;
}

// Modal style
// const modalStyle = {
//   position: "absolute" as const,
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: "90%",
//   maxWidth: 500,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
//   borderRadius: 2,
// };

const AdminPage: React.FC = () => {
  // const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
       const [adminUser, setAdminUser] = useState<admin | null>(null);
     
    const [activeSection,setActiveSection] = useState("users")
  
  // const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false); // Loading state for actions
  // const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
  const router = useRouter(); // Use the router hook
  const dispatch=useAppDispatch()
  const {users}=useAppSelector(store=>store.admin)

  // Custom Dark Theme
  // const darkTheme = createTheme({
  //   palette: {
  //     mode: "dark",
  //     background: {
  //       default: "#121212",
  //       paper: "#1e1e1e",
  //     },
  //     text: {
  //       primary: "#ffffff",
  //       secondary: "#b0b0b0",
  //     },
  //     primary: {
  //       main: "#bb86fc",
  //     },
  //   },
  // });

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true); // Start loading while fetching users
    try {
      const {
        data: { session },error:sessionError
      } = await supabase.auth.getSession();
      if(session?.user){
        setAdminUser({
          email:session.user.email || "",
          id: session.user.id,
          created_at:session.user.created_at || ""
        });
       }else{
         setAdminUser(null);
       }
      if(sessionError){
        throw sessionError;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, email, display_name,added_taskable")
        .eq("role", "user");
      if (error) throw error;
      dispatch(setUsers(data || []));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
        setErrorMessage(error.message);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false); // Stop loading after fetching users
    }
  };

  // Handle form submission
  // const onSubmit: SubmitHandler<FormInputs> = async ({ email, password, display_name }) => {
  //   setErrorMessage('');
  //   setLoading(true); // Start loading when adding a user
  //   try {
  //     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: { display_name: display_name || '' },
  //       },
  //     });

  //     if (signUpError) throw signUpError;

  //     const userId = signUpData.user?.id;
  //     if (!userId) throw new Error("User ID not found during sign-up.");

  //     const { error: insertError } = await supabase.from("users").insert([
  //       { id: userId, email, display_name, role: "user" },
  //     ]);

  //     if (insertError) throw insertError;

  //     const { error: insert2Error } = await supabase.from("taskusers").insert([
  //       { id: userId, email, display_name, role: "user" },
  //     ]);

  //     if (insert2Error) throw insert2Error;

  //     setUsers([...users, { id: userId, email, display_name }]);
  //     toast.success("Sign-up successful!", { position: "top-center" });
  //     reset();
  //     setOpen(false);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error("Error fetching users:", error.message);
  //       setErrorMessage(error.message);
  //     } else {
  //       console.error("Unknown error:", error);
  //     }
  //   } finally {
  //     setLoading(false); // Stop loading after form submission
  //   }
  // };

  // Handle delete user
  // const handleDeleteUser = async (userId: string) => {
  //   if (!confirm("Are you sure you want to delete this user?")) return;

  //   setLoading(true); // Start loading when deleting user

  //   try {
  //     // Delete user from taskusers table
  //     const { error: taskUserError } = await supabase
  //       .from("taskusers")
  //       .delete()
  //       .match({ id: userId });
  //     if (taskUserError) throw taskUserError;

  //     // Delete user from users table
  //     const { error: usersError } = await supabase
  //       .from("users")
  //       .delete()
  //       .match({ id: userId });
  //     if (usersError) throw usersError;

  //     // Delete user from Supabase authentication
  //     const response = await fetch(`/api/users/delete`, {
  //       method: "DELETE",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok)
  //       throw new Error(result.error || "Failed to delete user");

  //     // Update local state to remove the user
  //     setUsers(users.filter((user) => user.id !== userId));
  //     toast.success("User deleted successfully!");
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error("Error fetching users:", error.message);
  //       setErrorMessage(error.message);
  //     } else {
  //       console.error("Unknown error:", error);
  //     }
  //   } finally {
  //     setLoading(false); // Stop loading after deletion
  //   }
  // };

  const handleAddUser =async (user: User) => {
      setLoading(true); // Start loading when adding user to taskable users table
      try {
        const { error: insertError } = await supabase
         .from("taskusers")
         .insert([{ id: user.id, email: user.email, display_name: user.display_name }])
         

          if (insertError) throw insertError;

          // Update the user in local state to mark it as added to taskable users table
          const {error:updateError}=await supabase.from("users")
          .update({added_taskable:true})
          .eq("id",user.id)

          if(updateError) throw updateError;
          
             dispatch(setUsers(users.map((u:User) => u.id === user.id? {...u, added_taskable: true } : u)) // Update the user in local state to mark it as added to taskable users table
            ) 
            dispatch(addTaskableUsers({
              id:user.id,
              display_name: user.display_name,
              email: user.email,
            
            }))

          toast.success("User added to taskable users!", { position: "top-center" });
      }catch(error){
        if (error instanceof Error) {
          console.error("Error fetching users:", error.message);
          setErrorMessage(error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
      finally{
        setLoading(false); // Stop loading after adding user to taskable users table
      }

  };

  return (
     
    <ThemeProvider theme={darkTheme}>
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      
      {/* Sidebar Component (Same as User Dashboard) */}
      <Box
        sx={{
          width: 250, // Adjust width as needed
          bgcolor:"#1d1d1d",
          color:"#fff" ,
          p: 3,
          boxShadow: 3,
          height: "100vh",
          
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Admin Panel
        </Typography>
  
        <Button onClick={()=>{
          setActiveSection("details")
        }} fullWidth variant="outlined" color="secondary" sx={{ mb: 2 }}>
          My Details
        </Button>
        <Button onClick={()=>{
          setActiveSection("users")
        }} fullWidth variant="outlined" color="secondary" sx={{ mb: 2 }}>
          Manage Users
        </Button>
       
      </Box>
  
      {/* Main Content */}
      
      {
        activeSection==="users"?(
          <Box sx={{ textAlign: "center", width: "100%", p: 3 }}>
  <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
    Admin Dashboard
  </Typography>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => router.back()}
    sx={{ mb: 3, textTransform: "none", fontWeight: "bold" }}
  >
    Back
  </Button>

  <Box mt={4}>
    <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
      All User List
    </Typography>

    {errorMessage ? (
      <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
        {errorMessage}
      </Typography>
    ) : loading ? (
      <Box display="flex" justifyContent="center" mt={3}>
        <CircularProgress />
      </Box>
    ) : users.length > 0 ? (
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={2}>
        {users.map((user) => (
          <Card
            key={user.id}
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {user.display_name}
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Button
                variant="contained"
                color={user.added_taskable ? "success" : "primary"}
                onClick={() => handleAddUser(user)}
                disabled={user.added_taskable}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: user.added_taskable ? "grey.500" : "primary.main",
                  "&:hover": {
                    bgcolor: user.added_taskable ? "grey.500" : "primary.dark",
                  },
                  cursor: user.added_taskable ? "not-allowed" : "pointer",
                }}
              >
                {user.added_taskable ? "User Added" : "Add User"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    ) : (
      <Typography color="text.secondary">No users found.</Typography>
    )}
  </Box>

  <Typography variant="h6" sx={{ borderBottom: "2px solid white", width: "100%", my: 2 }} />

  <TaskableUsers />
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
              sx={{ color:  "#fff" , fontWeight: "bold" }}
            >
              My Details
            </Typography>
          
            {/* User Info Card */}
            <Box
              sx={{
                bgcolor:  "#1d1d1d" ,
                color:  "#fff",
                padding: 4, // Increased padding
                borderRadius: 2,
                boxShadow: 3,
                width: "100%",
                maxWidth: 600, // Increased width
              }}
            >
              
              <Typography variant="h6">Email: {adminUser?.email || "N/A"}</Typography>
              <Typography variant="h6">
                Joined:{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date(adminUser?.created_at || "N/A"))}
              </Typography>
            </Box>
          </Box>
          
          
          )
      }

    </Box>
  </ThemeProvider>
  
  );
};

export default AdminPage;
