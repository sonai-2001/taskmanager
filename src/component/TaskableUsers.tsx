"use client";
import { FC, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Box,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";
import supabase from "@/supabase/supaClient";
import { darkTheme } from "@/helper/theme";
import {  setTaskableUser, setUsers } from "@/redux-toolkit/slice/adminSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/page";

// interface TaskableUser {
//   id: string;
//   display_name: string;
//   email: string;
// }

const TaskableUsers: FC = () => {
  // const [taskableUsers, setTaskableUsers] = useState<TaskableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch=useAppDispatch()
  const {taskableUsers,users}=useAppSelector(store=>store.admin)

  useEffect(() => {
    const getTaskableUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("taskusers")
          .select("id,display_name,email");
        if (error) {
          throw error;
        }
        console.log("the taskable data is ",data)
        dispatch(setTaskableUser(data));
        setLoading(false);
        // const users = await fetchTaskableUsers();
        // setTaskableUsers(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching users:", error.message);
          setErrorMessage(error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
    };
    getTaskableUsers();
  }, [])
    
  const handleRemoveUser = async (id: string) => {
    try {
      setLoading(true);
      await removeTaskableUser(id);
    const { error } = await supabase
    .from("users")
    .update({added_taskable:false})
    .eq("id", id);

    if(error) throw error

    dispatch(setTaskableUser(taskableUsers.filter((user) => user.id !== id)));
    dispatch(setUsers(users.map((user)=>{
           if(user.id===id){
             return {...user, added_taskable: false }
           }else{
             return user;
           }
    })))
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
        setErrorMessage(error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }finally{
      setLoading(false)
    }
  }
  //    const fetchTaskableUsers = async (): Promise<TaskableUser[]> => {
  //     const { data, error } = await supabase.from("taskusers").select("id,display_name,email");
  //     if (error) {
  //       console.error("Error fetching taskable users:", error);
  //       return [];
  //     }
  //     return data;
  //   };

  const removeTaskableUser = async (id: string): Promise<void> => {
    const { error } = await supabase.from("taskusers").delete().eq("id", id);
    if (error) {
      console.error("Error removing user:", error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ mt: 5 }}>
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Taskable Users
        </Typography>
        {errorMessage ? (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mt: 2 }}
          >
            {errorMessage}
          </Typography>
        ) : loading ? (
          <CircularProgress />
        ) : (
          <Box
            sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
          >
            {taskableUsers.length>0?(
                taskableUsers.map((user) => (
                    <Card
                      key={user.id}
                      sx={{
                        maxWidth: 300,
                        m: 2,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <CardHeader
                        title={
                          <Typography
                            variant="h6"
                            color="text.primary"
                            textAlign="center"
                          >
                            {user.display_name}
                          </Typography>
                        }
                        subheader={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                          >
                            {user.email}
                          </Typography>
                        }
                      />
                      <CardContent sx={{ textAlign: "center", width: "100%" }}>
                        <Button
                          variant="contained"
                          color="error"
                          fullWidth
                          onClick={() => handleRemoveUser(user.id)}
                          sx={{ mt: 2, borderRadius: 2 }}
                        >
                          Remove User
                        </Button>
                      </CardContent>
                    </Card>
                  ))
            ):(
                 <Typography color="text.secondary">No taskable users found.</Typography>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
};

export default TaskableUsers;
