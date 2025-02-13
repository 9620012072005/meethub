import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Badge,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../api";

const ProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notifications, setNotifications] = useState({});
  const navigate = useNavigate();
  const socket = useRef(null);

  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("https://meethub-backend.onrender.com");
    }

    // Join socket room when the component mounts
    socket.current.emit("join", { userId: currentUserId });

    // Listen for new messages
    socket.current.on("new_message", (data) => {
      console.log("New message received:", data);
      // You can handle the new message here (e.g., update chat state)
    });

    // Listen for new notifications
    socket.current.on("new_notification", (data) => {
      console.log("New notification received:", data);
      setNotifications((prevNotifications) => ({
        ...prevNotifications,
        [data.senderId]: data.messageCount,
      }));
    });

    // Listen for notification read status
    socket.current.on("notifications_read", (userId) => {
      console.log(`${userId}'s notifications have been marked as read.`);
      // You can handle the notification read status here
    });

    // Clean up socket connections on unmount
    return () => {
      socket.current.off("new_message");
      socket.current.off("new_notification");
      socket.current.off("notifications_read");
    };
  }, [currentUserId]);

  // Fetch profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("userToken");

        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await api.get(
          `https://meethub-backend.onrender.com/api/users/profiles?page=${page}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfiles(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [page]);

  const handleProfileClick = (profileId, name, avatar) => {
    navigate(`/chat`, {
      state: { userId: profileId, name: name, avatar: avatar },
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (profiles.length === 0) {
    return <Typography>No profiles found.</Typography>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Profiles
      </Typography>
      <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
        <List>
          {profiles.map((profile) => (
            <ListItem
              button
              key={profile._id}
              onClick={() => handleProfileClick(profile._id, profile.name, profile.avatar)}
              sx={{
                display: "flex",
                alignItems: "center",
                background: " linear-gradient(45deg, #A770EF , #CF8BF3, #FDB99B)",
                borderRadius: 2,
                marginBottom: 2,
                transition: "all 0.3s ease", // Smooth transition for hover
                "&:hover": {
                  background: "linear-gradient(45deg, #f953c6, #b91d73)", // Hover effect gradient change
                  boxShadow: 4,
                },
                padding: 1,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                badgeContent={notifications[profile._id] > 0 ? (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "green",
                    }}
                  >
                    <Typography
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "0.5rem",
                        color: "#fff",
                      }}
                    >
                      {notifications[profile._id]}
                    </Typography>
                  </Box>
                ) : null}
              >
                <Avatar
                  alt={profile.name}
                  src={profile.avatar ? `https://meethub-backend.onrender.com${profile.avatar}` : "/default-avatar.png"}
                  sx={{ width: 50, height: 50, marginRight: 2 }}
                />
              </Badge>
              <ListItemText
                primary={profile.name || "Unknown User"}
                secondary="Tap to chat"
                sx={{
                  "& .MuiListItemText-secondary": {
                    fontSize: "0.9rem",
                    color: "#fff", // White color for text in gradient item
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Typography>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
  
};

export default ProfileList;
