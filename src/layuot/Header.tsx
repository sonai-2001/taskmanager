"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import supabase from "@/supabase/supaClient";
import { toast } from "react-toastify";
import { useRouter,usePathname } from "next/navigation";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname=usePathname()
  // const theme = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };



  const handleSignOut = async () => {
    // 1️⃣ Sign out from Supabase
    await supabase.auth.signOut();
  
    // 2️⃣ Clear session cookies on the server
    await fetch("/api/auth/store-session", {
      method: "POST",
      body: JSON.stringify({ access_token: "", refresh_token: "" }),
      headers: { "Content-Type": "application/json" },
    });
  
    // 3️⃣ Redirect user & show success message
    toast.success("Logged out successfully!");
    router.push("/");
  };
  
  
  

 
 

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor:  "#121212" ,
        color: "#ffffff", 
        boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            Task Manager
          </Link>
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
          
          {
            pathname!="/" && (
            <Button
            color="inherit"
            variant="outlined"
            sx={{
              borderColor:  "#ffffff" ,
              color: "#ffffff" ,
            }}
            onClick={handleSignOut}
          >
            Logout
          </Button>)
          }

          
        </Box>

       {
        pathname!="/" && ( <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {/* Only Logout Button in Hamburger Menu */}
{
  pathname!="/" && (
            <MenuItem onClick={handleSignOut}>Logout</MenuItem>)
}          </Menu>
        </Box>)
       }
      </Toolbar>
    </AppBar>
  );
};

export default Header;
