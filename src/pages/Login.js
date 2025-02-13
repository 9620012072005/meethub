import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";
import { gsap } from "gsap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // GSAP animation on mount
    gsap.fromTo(
      ".login-box",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const response = await api.post("https://meethub-backend.onrender.com/api/users/login", {
        email,
        password,
      }, {
        headers: {
          "Content-Type": "application/json", // Ensure correct content type
        },
      });
  
      if (response.status === 200) {
        const { token, user } = response.data;
        // Store the token and user data in localStorage
        localStorage.setItem("userToken", token);
        localStorage.setItem("currentUserId", user.id); // Store the currentUserId separately
        localStorage.setItem("currentUser", JSON.stringify(user)); // Store full user info
        
        alert("Login successful!");
        navigate("/feed");
      }
    } catch (err) {
      console.error("Login error:", err);  // Log full error object for debugging
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div>
     
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #ff7e5f, #feb47b)",
        padding: { xs: 2, sm: 3, md: 4 }, // Add padding for small screens
      }}
    >
       
      <Paper
        elevation={3}
        sx={{
          width: { xs: "100%", sm: "90%", md: "400px" }, // Responsive width
          maxWidth: "350px", // Maximum width on mobile
          padding: { xs: 3, sm: 4 }, // Adjust padding on smaller screens
          textAlign: "center",
          borderRadius: 4,
          background: "white",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
          margin: { xs: "16px", sm: "20px", md: "0px" }, // Margin for mobile & tablets
        }}
      >

        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              background: "linear-gradient(to right, #f12711, #f5af19)",
              color: "white",
              fontWeight: "bold",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                background: "linear-gradient(to right, #f12711, #f5af19)",
              },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography
            variant="body2"
            sx={{
              marginTop: 1,
              fontSize: { xs: "12px", sm: "14px" }, // Smaller text on mobile
            }}
          >
            Don't have an account?{" "}
            <a href="/register" style={{ color: "#f12711" }}>Sign Up</a>
          </Typography>
        </Box>
       
      </Paper>
      
    </Box>
    </div>
     
  
  );
};

export default Login;