import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Typography, CircularProgress, Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api";
const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const [profiles, setProfiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const storedUser = localStorage.getItem("currentUser");
  const currentUserId = currentUser?.id; // Extract id properly
  console.log("Current User ID:", currentUserId);
  


  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await api.get("https://meethub-backend.onrender.com/api/users/profiles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfiles(response.data.users || []);
      } catch (err) {
        console.error("Error fetching profiles", err);
      }
    };

    fetchProfiles();

    if (!userId) {
      navigate("/profilelist");
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return console.error("No token found");
  
        if (!userId || userId.length !== 24) return console.error("Invalid userId");
  
        // ✅ Fetch the logged-in user's details
        const currentUserResponse = await api.get("https://meethub-backend.onrender.com/api/users/auth/currentUser", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!currentUserResponse.data || !currentUserResponse.data._id) {
          console.error("Failed to fetch current user");
          return;
        }
  
        setCurrentUser(currentUserResponse.data);
        console.log("✅ Current User Data:", currentUserResponse.data);
  
        // ✅ Fetch messages
        const messagesResponse = await api.get(`https://meethub-backend.onrender.com/api/messages/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setMessages(messagesResponse.data.messages || []);
        console.log("✅ Messages Fetched:", messagesResponse.data.messages);
  
        // ✅ Fetch receiver's user details
        const userResponse = await api.get(`https://meethub-backend.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setUser(userResponse.data);
        console.log("✅ Receiver User Data:", userResponse.data);
      } catch (err) {
        console.error("Error fetching chat data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChatData();
  
    // Initialize socket connection
    socket.current = io("https://meethub-backend.onrender.com");
  
    socket.current.on("typing", () => {
      setIsTyping(true);
    });
  
    socket.current.on("stop_typing", () => {
      setIsTyping(false);
    });
  
    socket.current.on("send_message", (data) => {
      console.log("📩 Incoming Message:", data);
      if (data.roomId === userId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });
  
    return () => {
      socket.current.disconnect();
    };
  }, [userId]);
  
  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        sender: { _id: currentUserId, name: currentUser.name, avatar: currentUser.avatar },
        content: message,
        timestamp: new Date().toISOString(),
      };
  
      setMessages((prevMessages) => [...prevMessages, newMessage]); // ✅ Update UI instantly
  
      setMessage(""); // ✅ Clear input field immediately
  
      try {
        const token = localStorage.getItem("userToken");
  
        // Send message to backend
        await api.post(
          "https://meethub-backend.onrender.com/api/messages/send",
          { receiverId: userId, content: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Emit the message through Socket.io
        if (socket.current) {
          socket.current.emit("send_message", { roomId: userId, message: newMessage });
        }
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
  };
  
  const handleTyping = () => {
    socket.current.emit("typing", { roomId: userId, senderId: currentUserId });
  };

  const getAvatarUrl = (avatarPath) => {
    return avatarPath ? `https://meethub-backend.onrender.com${avatarPath}` : "/default-avatar.png";
  };
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return console.error("No token found");

        if (!userId || userId.length !== 24) return console.error("Invalid userId");

        // ✅ Fetch messages
        const messagesResponse = await api.get(`https://meethub-backend.onrender.com/api/messages/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched Messages:", messagesResponse.data.messages); // ✅ Log message data
        setMessages(messagesResponse.data.messages || []);

        // ✅ Fetch user details
        const userResponse = await api.get(`https://meethub-backend.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Receiver User Data:", userResponse.data); // ✅ Log receiver data
        setUser(userResponse.data);

        // ✅ Fetch current user
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (storedUser) {
          console.log("Current User Data:", storedUser); // ✅ Log current user data
          setCurrentUser(storedUser);
        }
      } catch (err) {
        console.error("Error fetching chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // ✅ Initialize socket connection
    socket.current = io("https://meethub-backend.onrender.com");

  socket.current.on("typing", () => setIsTyping(true));
  socket.current.on("stop_typing", () => setIsTyping(false));

  socket.current.on("send_message", (data) => {
    console.log("📩 Incoming Message:", data);

    // Only update state if the message is for the correct chat
    if (data.roomId === userId) {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    }
  });

  return () => socket.current.disconnect();
}, [userId]);
 // ✅ Only run when userId changes
  // userId should be the only dependency here.
  
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        maxWidth: "600px",
        height: "100vh",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to top, #38A1D6, white)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          background: "linear-gradient(135deg, #F538B9 ,rgb(207, 188, 247), #61CEF2, #F538B9)", // Multiple gradient colors
          borderRadius: "8px", // Rounded corners for the header
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)", // Soft shadow around the header
        }}
      >
        <Avatar
          alt={user.name || "User"}
          src={getAvatarUrl(user.avatar)}
          sx={{
            width: 60,
            height: 60,
            border: "3px solid white", // Thicker border for the avatar
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow around the avatar
          }}
        />
        <Typography
          variant="h5" // Larger text size for a bolder effect
          sx={{
            fontWeight: "600", // Bolder font weight
            color: "#fff",
            marginLeft: 2,
            background: "linear-gradient(to right, #ff758c, #ff7eb3, #f7c5f2)", // Gradient text effect
            WebkitBackgroundClip: "text",
            
            textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", // Text shadow for added depth
          }}
        >
          Chat with {user.name}
        </Typography>
      </Box>

<Box
  sx={{
    flex: 1,
    overflowY: "auto",
    padding: 2,
    background: "linear-gradient(to bottom, #fdfbfb, #ebedee)",
    "&::-webkit-scrollbar": {
      display: "none", // Hide scrollbar
    },
    msOverflowStyle: "none", // For IE & Edge
    scrollbarWidth: "none", // For Firefox
  }}
>
  {messages.map((msg, index) => {
    const senderId = msg.sender?._id;
    const receiverId = msg.receiver?._id;

    // Check if the message was sent by the current user
    const isCurrentUserSender = senderId === currentUserId;
    // Check if the message was received by the current user
    const isCurrentUserReceiver = receiverId === currentUserId;

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: isCurrentUserSender ? "flex-end" : "flex-start",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        {/* Show avatar for received messages (left side) */}
        {isCurrentUserReceiver && (
          <Avatar
            alt={msg.sender?.name || "User"}
            src={getAvatarUrl(msg.sender?.avatar || "/default-avatar.png")}
            sx={{ width: 35, height: 35, marginRight: 1 }}
          />
        )}

        {/* Message Bubble */}
        <Box
          sx={{
            maxWidth: "70%",
            padding: "10px 14px",
            borderRadius: "18px",
            background: isCurrentUserSender
              ? "linear-gradient(to right, #36d1dc, #5b86e5)" // Current user (right)
              : "linear-gradient(to right, #fc5c7d, #6a82fb)", // Other user (left)
            color: "#fff",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            textAlign: isCurrentUserSender ? "right" : "left",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography variant="body1" sx={{ wordWrap: "break-word" }}>
            {msg.content}
          </Typography>
        </Box>

        {/* Show avatar for sent messages (right side) */}
        {isCurrentUserSender && (
          <Avatar
            alt={msg.sender?.name || "User"}
            src={getAvatarUrl(msg.sender?.avatar || "/default-avatar.png")}
            sx={{ width: 35, height: 35, marginLeft: 1 }}
          />
        )}
      </Box>
    );
  })}

  {/* Typing Indicator */}
  {isTyping && (
    <Typography sx={{ color: "#888", fontStyle: "italic" }}>
      {user.name} is typing...
    </Typography>
  )}

  <div ref={messagesEndRef} />
</Box>


      {/* Input */}
      <Box
        sx={{
          display: "flex",
          padding: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <TextField
          fullWidth
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping(); // Trigger typing event
          }}
          placeholder="Type a message..."
          variant="outlined"
          sx={{ backgroundColor: "#fff", borderRadius: "10px" }}
        />
       <IconButton
  onClick={handleSendMessage}
  sx={{
    backgroundImage: "linear-gradient(135deg, #F0EAFC,rgb(64, 186, 226),rgb(243, 33, 177))",
    color: "#fff",
    marginLeft: 2,
    padding: "10px",
    transition: "transform 0.3s ease-in-out",
    "&:hover": { 
      transform: "scale(1.1)",
      filter: "brightness(1.1)"
    },
  }}
>
  <SendIcon />
</IconButton>

      </Box>
    </Box>
        
  );
};

export default Chat; 