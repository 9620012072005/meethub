import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Button, IconButton, Card } from "@mui/material";
import { gsap } from "gsap";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";

const ProfileDashboard = ({ user }) => {
  const [about, setAbout] = useState(user?.about || "");
  const [personalDetails, setPersonalDetails] = useState(user?.personalDetails || "");
  const [role, setRole] = useState(user?.role || "");
  const [showForm, setShowForm] = useState(false);

  const roles = ["Software Developer", "Web Designer", "Student", "Working Professional"];

  useEffect(() => {
    gsap.from(".dashboard-card", {
      duration: 1.5,
      opacity: 0,
      y: 50,
      ease: "power3.out",
    });
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      console.error("User token is missing.");
      return;
    }

    const profileData = {
      about,
      personalDetails,
      role,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/profiledetails", // API route for storing profile data
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setAbout(response.data.profileDetails.about);
        setPersonalDetails(response.data.profileDetails.personalDetails);
        setRole(response.data.profileDetails.role);

        setShowForm(false);
      }
    } catch (error) {
      console.error("Error storing profile:", error.response?.data || error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setAbout(user?.about || "");
    setPersonalDetails(user?.personalDetails || "");
    setRole(user?.role || "");
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleDelete = () => {
    setAbout("");
    setPersonalDetails("");
    setRole("");
  };

  return (
    <Card className="dashboard-card" sx={{ marginTop: 3, padding: 3, backgroundColor: "#fff", boxShadow: 3, borderRadius: 2, }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>Dashboard</Typography>

      {!showForm ? (
        <>
          <Box sx={{ marginTop: 2, textAlign: "left" }}>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>About:</strong> {about || "Enter your about details"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Personal Details:</strong> {personalDetails || "Enter your personal details"}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Role:</strong> {role || "Enter your role"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-start", marginTop: 2 }}>
            <IconButton onClick={handleEdit} sx={{ marginRight: 2 }}>
              <EditIcon sx={{ color: "#1976d2" }} />
            </IconButton>
            <IconButton onClick={handleDelete}>
              <DeleteIcon sx={{ color: "#e53935" }} />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box sx={{ marginTop: 2, textAlign: "left" }}>
          <TextField label="About" value={about} onChange={(e) => setAbout(e.target.value)} variant="outlined" fullWidth margin="normal" />
          <TextField label="Personal Details" value={personalDetails} onChange={(e) => setPersonalDetails(e.target.value)} variant="outlined" fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
              {roles.map((role, index) => (
                <MenuItem key={index} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ marginRight: 2 }}>Save</Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default ProfileDashboard;
