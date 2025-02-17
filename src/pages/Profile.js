import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Avatar, TextField, MenuItem, Select, 
  FormControl, InputLabel, Button, IconButton, Card , CardContent, Divider,
} from "@mui/material";
import axios from "axios";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { gsap } from "gsap";
import api from "../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [about, setAbout] = useState("");
  const [personalDetails, setPersonalDetails] = useState("");
  const [role, setRole] = useState("");
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState([]); // Store all profiles
  const cloudinaryBaseURL = "https://res.cloudinary.com/dz4hvyd4n/image/upload/";
  const roles = ["Software Developer", "Web Designer", "Student", "Working Professional"];
  const avatarURL = avatar ? avatar.replace(/^http:\/\//i, "https://") : "/default-avatar.png";

  useEffect(() => {
    const token = localStorage.getItem("userToken");
  
    if (token) {
     
      // Fetch all profiles
      api.get("https://meethub-backend.onrender.com/api/profiledetails/all", { 
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("All Profiles Response:", response.data);
        setAllProfiles(response.data?.data || []);
      })
      .catch((error) => {
        console.error("Error fetching all profiles:", error.response?.data || error);
      });
    } else {
      window.location.href = "/login";
    }
  }, []);
  

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (token) {
      api.get("https://meethub-backend.onrender.com/api/profiledetails", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Profile Details Response:", response.data);
        const profile = response.data?.data || {}; // Corrected access
        setAbout(profile.about || ""); 
        setPersonalDetails(profile.personalDetails || ""); 
        setRole(profile.role || ""); 
      })
      .catch((error) => {
        console.error("Error fetching profile details:", error.response?.data || error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userToken");
          window.location.href = "/login";
        }
      });

      api
        .get("https://meethub-backend.onrender.com/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User Profile Data:", response.data);
          setUser(response.data?.data || {});

        })
        .catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("userToken");
            window.location.href = "/login";
          }
        });
    } else {
      window.location.href = "/login";
    }
  }, []);

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
  
    const allowedRoles = ["Software Developer", "Web Designer", "Student", "Working Professional"];
    const validRole = allowedRoles.includes(role) ? role : "Software Developer";
  
    const profileData = { about, personalDetails, role: validRole };
  
    try {
      // Step 1: Check if profile details exist (GET request)
      const checkResponse = await api.get("https://meethub-backend.onrender.com/api/profiledetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const profileExists = checkResponse.data?.data; // If profile data exists, update it
      console.log("Profile check response:", checkResponse.data);
  
      // Step 2: Determine whether to perform POST (create) or PUT (update)
      const url = profileExists
        ? "https://meethub-backend.onrender.com/api/profiledetails/update" // PUT if profile exists
        : "https://meethub-backend.onrender.com/api/profiledetails"; // POST if no profile found
  
      const method = profileExists ? "PUT" : "POST";
  
      console.log(`${profileExists ? "Updating" : "Creating"} profile details...`);
  
      // Step 3: Perform the API request
      const response = await api({
        method,
        url,
        data: profileData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Step 4: Update UI state
      if (response.data) {
        console.log(`${profileExists ? "Updated" : "Created"} profile details successfully`, response.data);
  
        setUser((prevUser) => ({
          ...prevUser,
          about: response.data.data?.about || "",
          personalDetails: response.data.data?.personalDetails || "",
          role: response.data.data?.role || "",
        }));
  
        setEditing(false);
        setShowForm(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No existing profile found, creating a new one...");
        
        // If GET request fails (profile not found), try creating a new one (POST)
        try {
          const response = await api.post("https://meethub-backend.onrender.com/api/profiledetails", profileData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          console.log("Profile created successfully", response.data);
  
          setUser((prevUser) => ({
            ...prevUser,
            about: response.data.data?.about || "",
            personalDetails: response.data.data?.personalDetails || "",
            role: response.data.data?.role || "",
          }));
  
          setEditing(false);
          setShowForm(false);
        } catch (postError) {
          console.error("Error creating profile:", postError.response?.data || postError);
        }
      } else {
        console.error("Error fetching profile:", error.response?.data || error);
      }
    }
  };
  

  const handleEdit = () => {
    setEditing(editing);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setShowForm(false);
    setAbout(user?.about || "");
    setPersonalDetails(user?.personalDetails || "");
    setRole(user?.role || "");
  };
  
  const handleDelete = async () => {
    const token = localStorage.getItem("userToken");
  
    if (!token) {
      console.error("User token is missing.");
      return;
    }
  
    try {
      const response = await api.delete("https://meethub-backend.onrender.com/api/profiledetails/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        console.log("Profile details deleted successfully.");
  
        // Reset fields to empty after successful deletion
        setAbout("");
        setPersonalDetails("");
        setRole("");
      }
    } catch (error) {
      console.error("Error deleting profile details:", error.response?.data || error);
    }
  };
  
  if (!user || Object.keys(user).length === 0) {
    return <Typography variant="h6" color="textSecondary">Loading...</Typography>;
  }
  if (!user) {
    return <Typography variant="h6" color="textSecondary">Loading...</Typography>;
  }
  
return (
  <Box sx={{ padding: 4, textAlign: "center", maxWidth: 800, margin: "auto",background: " linear-gradient(45deg, #A770EF , #CF8BF3, #FDB99B)" }}>
    {/* Profile Avatar with Hover Effect */}
    <Avatar
      sx={{
        width: 140,
        height: 140,
        margin: "0 auto",
        border: "5px solid #1976d2",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.3s ease-in-out",
        "&:hover": { transform: "scale(1.1)" },
      }}
      src={user.avatar ? `${cloudinaryBaseURL}${user.avatar}` : "/default-avatar.png"} 
      alt={user.name || "User"}
    >
      {user.name?.[0]?.toUpperCase() || "?"}
    </Avatar>

    {/* Name & Email */}
    <Typography variant="h4" sx={{ marginTop: 2, fontWeight: "bold", color: "#222" }}>
      {user.name || "Unknown User"}
    </Typography>
    <Typography variant="body1" sx={{ color: "#777", fontSize: "1rem" }}>
      {user.email || "No email available"}
    </Typography>

    {/* Dashboard Card */}
    <Card
      className="dashboard-card"
      sx={{
        marginTop: 4,
        padding: 4,
        backgroundColor: "#fff",
        boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.15)",
        borderRadius: 3,
        transition: "all 0.3s",
        "&:hover": { boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.25)" },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2", textAlign: "center" }}>
        Dashboard
      </Typography>

      {!showForm ? (
        <>
          {/* User Details */}
          <Box sx={{ marginTop: 3, textAlign: "left", padding: 2 }}>
            <Typography variant="body1" sx={{ marginBottom: 2, fontSize: "1rem" }}>
              <strong>About:</strong> {about || <span style={{ color: "#888" }}>Enter your about details</span>}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2, fontSize: "1rem" }}>
              <strong>Personal Details:</strong> {personalDetails || <span style={{ color: "#888" }}>Enter your personal details</span>}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2, fontSize: "1rem" }}>
              <strong>Role:</strong> {role || <span style={{ color: "#888" }}>Enter your role</span>}
            </Typography>
          </Box>

          {/* Edit & Delete Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2, gap: 2 }}>
            <IconButton onClick={handleEdit} sx={{ transition: "transform 0.2s", "&:hover": { transform: "scale(1.2)" } }}>
              <EditIcon sx={{ color: "#1976d2", fontSize: 30 }} />
            </IconButton>
            <IconButton onClick={handleDelete} sx={{ transition: "transform 0.2s", "&:hover": { transform: "scale(1.2)" } }}>
              <DeleteIcon sx={{ color: "#e53935", fontSize: 30 }} />
            </IconButton>
          </Box>
        </>
      ) : (
        <Box sx={{ marginTop: 3, textAlign: "left", padding: 2 }}>
          {/* Form Fields */}
          <TextField
            label="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />
          <TextField
            label="Personal Details"
            value={personalDetails}
            onChange={(e) => setPersonalDetails(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#1976d2" },
                  "&:hover fieldset": { borderColor: "#1976d2" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
              }}
            >
              {roles.map((role, index) => (
                <MenuItem key={index} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Save & Cancel Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{
                padding: "10px 20px",
                fontWeight: "bold",
                textTransform: "none",
                transition: "all 0.3s",
                "&:hover": { backgroundColor: "#005bb5" },
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              sx={{
                padding: "10px 20px",
                fontWeight: "bold",
                textTransform: "none",
                transition: "all 0.3s",
                "&:hover": { backgroundColor: "#ffebee" },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Card>
    <Box sx={{ padding: 4, textAlign: "center", maxWidth: 800, margin: "auto" ,background: " linear-gradient(45deg, #A770EF , #CF8BF3, #FDB99B)"}}>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        All User Profiles
      </Typography>

      {allProfiles.length > 0 ? (
  allProfiles.map((profile) => (
    <Card key={profile._id} sx={{ marginBottom: 3, padding: 2 , borderRadius:5}}>
      <CardContent>
        {/* Display Avatar */}
        <Avatar 
          src={user.avatar ? `${cloudinaryBaseURL}${user.avatar}` : "/default-avatar.png"} 
          sx={{ width: 80, height: 80, margin: "auto" }} 
        />

        {/* Display Name */}
        <Typography variant="h5" sx={{ fontWeight: "bold", marginTop: 1 }}>
          {profile.user?.name || "Unknown User"}
        </Typography>

        {/* Display Role */}
        <Typography variant="body1" color="textSecondary">
          {profile.role || "No role specified"}
        </Typography>

        {/* Display About */}
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          {profile.about || "No about details provided"}
        </Typography>

        {/* Display Personal Details */}
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          {profile.personalDetails || "No personal details provided"}
        </Typography>
      </CardContent>
      <Divider />
    </Card>
  ))
) : (
  <Typography>No profiles found.</Typography>
)}


    </Box>
  </Box>

);

};

export default Profile;
