
"use client"
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import supabase from "@/supabase/supaClient";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();
  

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
        sessionStorage.removeItem("user");
        toast.success("You have been logged out!", { position: "top-center" });
        router.push("/");
      } catch (error: any) {
        toast.error("Error logging out!", { position: "top-center" });
      }
    };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            MyBrand
          </Link>
        </Typography>

        {/* Links for larger screens */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
         <Button
         color="inherit"
         onClick={handleSignOut}
         >

          Logout
         </Button>
        </Box>

        {/* Hamburger menu for smaller screens */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {menuItems.map((item) => (
              <MenuItem key={item.label} onClick={handleMenuClose}>
                <Link href={item.path} style={{ textDecoration: "none", color: "inherit" }}>
                  {item.label}
                </Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
