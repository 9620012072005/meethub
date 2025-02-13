import React, { useEffect, useState, useRef } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Drawer, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { gsap } from "gsap";
import api from "../api";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // State to control the logout confirmation dialog
  const navLinksRef = useRef([]);
  const drawerRef = useRef(null);
  const titleRef = useRef(null); // Ref for Typography
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await api.get("https://meethub-backend.onrender.com/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data?.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("userToken");
            window.location.href = "/login";
          }
        }
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    gsap.fromTo(
      "nav",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );
  }, []);
  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 }, // Start position (below)
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" } // Move to normal position
    );
  }, []);
  const handleOpen = () => {
    setOpen(true);
    gsap.fromTo(
      drawerRef.current,
      { x: "100%" },
      { x: 0, duration: 0.5, ease: "power2.out" }
    );
  };

  const handleClose = () => {
    gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power2.in", onComplete: () => setOpen(false) });
  };

  const handleLogoutDialogOpen = () => {
    setDialogOpen(true); // Open the logout confirmation dialog
  };

  const handleLogoutDialogClose = () => {
    setDialogOpen(false); // Close the dialog without logging out
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/login"; // Perform the logout action
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #ff8c00, #ff0080)",
        boxShadow: "none",
        padding: "5px 5px",
      }}
    >
      <Toolbar>
      <img
          src="../assets/meethub.png"
          alt="MeetHub Logo"
          style={{ height: "50px", marginRight: "5px" }}
        />

  
        <Typography
          variant="h6"
          ref={titleRef}
          sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: "1px" }}
        >
          MeetHub!
        </Typography>
  
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 3 }}>
          {["Feed"].map((text, index) => (
            <Button
              key={text}
              color="inherit"
              href={`/${text.toLowerCase()}`}
              ref={(el) => (navLinksRef.current[index] = el)}
              sx={{
                position: "relative",
                fontSize: "16px",
                textTransform: "none",
                "&::after": {
                  content: "''",
                  width: "0%",
                  height: "3px",
                  background: "#fff",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  transition: "width 0.3s ease-in-out",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              {text}
            </Button>
          ))}
  
          <IconButton color="inherit" href="/profilelist">
            <ChatIcon />
          </IconButton>
  
          {user && (
            <>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  marginLeft: 2,
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  display: { xs: "none", sm: "inline-block" },
                }}
                src={user.avatar ? `https://meethub-backend.onrender.com${user.avatar}` : "/default-avatar.png"}
                alt={user.name || "User"}
                onClick={() => (window.location.href = "/profile")}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
              />
              <Button
                color="inherit"
                onClick={handleLogoutDialogOpen}
                sx={{
                  position: "relative",
                  "&::after": {
                    content: "''",
                    width: "0%",
                    height: "3px",
                    background: "#fff",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    transition: "width 0.3s ease-in-out",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
  
        {/* Mobile view: Avatar in the right corner */}
        <Box sx={{ display: { xs: "flex", sm: "none" }, justifyContent: "flex-end", width: "100%" }}>
          <IconButton color="inherit" href="/profilelist">
            <ChatIcon />
          </IconButton>
          {user && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                cursor: "pointer",
                transition: "transform 0.3s",
              }}
              src={user.avatar ? `https://meethub-backend.onrender.com${user.avatar}` : "/default-avatar.png"}
              alt={user.name || "User"}
              onClick={() => (window.location.href = "/profile")}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, duration: 0.3 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
            />
          )}
        </Box>
        <IconButton color="inherit" onClick={handleOpen} sx={{ display: { sm: "none" } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
  
      {/* Animated Drawer */}
      <Drawer anchor="right" open={open} onClose={handleClose} ref={drawerRef}>
      <Box
  sx={{
    width: 250,
    height: "100vh",  // Makes the Box take the full height of the viewport
    padding: 3,
    background: "linear-gradient(to bottom right, #FEAC5E, #C779D0, #4BC0C8)",
  }}
>
          <IconButton onClick={handleClose} sx={{ alignSelf: "flex-end" }}>
            <CloseIcon />
          </IconButton>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              marginLeft: 12,
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
            src={user?.avatar ? `http://localhost:5000${user.avatar}` : "/default-avatar.png"}
            alt={user?.name || "User"}
            onClick={() => (window.location.href = "/profile")}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, duration: 0.3 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Button href="/feed" color="inherit">Feed</Button>
            <Button href="/profile" color="inherit">Profile</Button>
            <Button href="/profilelist" color="inherit">Chat</Button>
            <Button color="inherit" onClick={handleLogoutDialogOpen}>Logout</Button>
          </Box>
        </Box>
      </Drawer>
  
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleLogoutDialogClose}
        sx={{
          '& .MuiDialog-paper': {
            animation: "fadeIn 0.5s ease-out",
          }
        }}
      >
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">You will be redirected to the login page if you proceed.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleLogout} color="secondary" autoFocus>Logout</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
  
};

export default Navbar;
