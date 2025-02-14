import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Paper, Avatar } from "@mui/material";
import { gsap } from "gsap";
import api from "../api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // GSAP animation
  useEffect(() => {
    gsap.fromTo(
      ".register-box",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file)); // Store preview separately
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs before sending to the server
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("All fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    // Debugging FormData (Ensuring it's not undefined)
    console.log("🛠️ Sending FormData:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Use `api.post` instead of axios.post with a hardcoded URL
      const response = await api.post("users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Registration Response:", response?.data);

      if (response?.status === 201) {
        alert("Registration successful! Please log in.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ Registration Error:", error?.response?.data || error.message);
      alert(error?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #ff7e5f, #feb47b)",
      }}
    >
      <Paper
        className="register-box"
        elevation={3}
        sx={{
          width: 400,
          padding: 4,
          textAlign: "center",
          borderRadius: 4,
          background: "white",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Avatar Input */}
          <Button
            variant="contained"
            component="label"
            fullWidth
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
            Upload Avatar
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              accept="image/jpeg, image/png, image/jpg"
            />
          </Button>

          {avatarPreview && (
            <Avatar alt="Avatar Preview" src={avatarPreview} sx={{ width: 60, height: 60, margin: "10px auto" }} />
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
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
            Register
          </Button>
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#f12711", fontWeight: "bold" }}>
              Login
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
