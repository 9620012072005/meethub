import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Menu,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Importing the 3-dots icon
import axios from "axios";
import CommentSection from "./CommentSection";
import { gsap } from "gsap";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api";

const PostCard = ({ postId, user = "Anonymous", content = "No content available", userId }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [Liked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const [tempLike, setTempLike] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // State for the menu anchor
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false); // State to manage edit mode
  const [newContent, setNewContent] = useState(content); // State to hold the updated content
  const [newImage, setNewImage] = useState(null); // State to hold the new image for update
  const [avatar, setAvatar] = useState(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const dialogRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [post, setPost] = useState(null); // Add state to hold post details
  const hasLiked = post?.likes?.some((like) => like.userId === userId) || false;
  const cloudinaryBaseURL = "https://res.cloudinary.com/dz4hvyd4n/image/upload/";

  const avatarURL = user?.avatar ? user.avatar.replace(/^http:\/\//i, "https://") : "/default-avatar.png";

  const handleOpen = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) {
        setError("Invalid post ID provided.");
        return;
      }
  
      try {
        const response = await api.get(`https://meethub-backend.onrender.com/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        });
        console.log(avatarURL);  // Log the constructed URL for debugging

        console.log("Fetched Post Data:", response.data);
        const { user, likes = [], comments = [], image: postImage, userId: postUserId } = response.data.post;
  
        setAvatar(user?.avatar || "/default-avatar.png");
        setImage(postImage || "/placeholder-image.png");
  
        setLikes(likes);
        setLikeCount(likes.length);
        setCommentCount(comments.length);
  
        // Correctly set initial hasLiked state
        setHasLiked(likes.some((like) => like.userId === currentUser._id));
  
        setIsOwner(postUserId === userId);
      } catch (err) {
        setError("Failed to fetch post details.");
        console.error("Error fetching post details:", err);
      }
    };
  
    fetchPostDetails();
  }, [postId, userId]); 
  
   // Depend on userId to reset likes when the user changes
  

   const handleLike = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
  
    // Optimistically update UI
    const alreadyLiked = likes.some((like) => like.userId === currentUser._id);
    const updatedLikes = alreadyLiked
      ? likes.filter((like) => like.userId !== currentUser._id)
      : [...likes, { userId: currentUser._id }];
  
    setLikes(updatedLikes);
    setLikeCount(updatedLikes.length);
    setTempLike(true); // Change color to red instantly
  
    try {
      const response = await api.post(
        `https://meethub-backend.onrender.com/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
  
      // Check if response contains expected keys
      if (response.data && typeof response.data.likesCount === "number") {
        setLikeCount(response.data.likesCount);
        setLikes(response.data.userHasLiked
          ? [...likes, { userId: currentUser._id }]
          : likes.filter((like) => like.userId !== currentUser._id)
        );
      } else {
        console.error("Invalid API response:", response.data);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert UI if API call fails
      setLikes(likes);
      setLikeCount(likes.length);
    } finally {
      setLoadingLike(false);
    }
  };
  
  
  // GSAP animation for card appearance
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );
  }, []);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    gsap.to(imageRef.current, {
      x: (clientX - centerX) / 30,
      y: (clientY - centerY) / 30,
      duration: 0.3,
      ease: "power1.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(imageRef.current, { x: 0, y: 0, duration: 0.5, ease: "power1.out" });
  };

  const handleOpenComments = () => {
    setShowComments(true);
    gsap.fromTo(
      dialogRef.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`https://meethub-backend.onrender.com/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      alert("Post deleted successfully.");
      // Optionally, redirect or refresh the page
      // For example: window.location.reload(); or redirect to the homepage
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Unauthorized action! Only the post owner can delete this post.");

    } finally {
      handleClose(); // Close the menu after the action
    }
  };
  
  

  const handleEditPost = async () => {
    if (!newContent) {
      setError("Content cannot be empty.");
      return;
    }
  
    const formData = new FormData();
    formData.append("content", newContent);
    if (newImage) formData.append("image", newImage);
  
    try {
      const response = await api.put(
        `https://meethub-backend.onrender.com/api/posts/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Response from server:", response);  // Inspect response for structure
  
      alert("Post updated successfully!");
      setEditing(false);
     
      setNewContent(response.data.post?.content || "");  // Provide fallback for content
    } catch (err) {
      console.error("Error editing post:", err);
      setError("Unauthorized action! Only the post owner can update this post.");

    }
  };
  

  return (


    <Card
      ref={cardRef}
      sx={{
        maxWidth: 400,
        height: 450,
        margin: "20px auto",
        paddingBottom: 3,
        padding:1,
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": { transform: "scale(2.8)", boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" },
      }}
    >
     <Box
  display="flex"
  alignItems="center"
  padding={2}
  sx={{
    position: "relative", // Ensure absolute positioning works for children
    background: "linear-gradient(90deg, #ff8c00, #ff0080)",
    borderRadius: "10px 10px 0 0",
    boxShadow: "inset 0 -2px 4px rgba(0, 0, 0, 0.1)",
  }}
>
    {/* Avatar Button */}
      <Avatar
       src={avatarURL}
        alt="User Avatar"
        sx={{
          width: 50,
          height: 50,
          marginRight: 2,
          border: "2px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "50%",
          objectFit: "cover",
          cursor: "pointer", // Make it clickable
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.1)" },
        }}
        onClick={handleOpen} // Open dialog on click
      />
 
  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" }}>
    {user}
  </Typography>

  {isOwner && (
    <IconButton
      sx={{
        position: "absolute",
        top: "50%",
        right: 8,
        transform: "translateY(-50%)", // Ensure vertical centering
        color: "#fff",
      }}
      onClick={handleClick}
    >
      <MoreVertIcon />
    </IconButton>
  )}
</Box>



      {image && (
  <Box sx={{ textAlign: "center" }}>
    <img
      ref={imageRef}
      src={image}
      alt="Post content"
      style={{
        width: "100%",
        height: 250,
        // borderRadius: "8px",
        objectFit: "cover",
        transition: "transform 0.3s",
        borderRadius: "0 0 10px 10px ",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  </Box>
)}

<Dialog open={editing} onClose={() => setEditing(false)} fullWidth>
      <DialogTitle>Edit Post</DialogTitle>
<CardContent>
  {editing ? (
    <>
      <TextField
        fullWidth
        variant="outlined"
        multiline
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        rows={3}
        sx={{ marginBottom: 2 }}
      />
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleEditPost} // Ensure this function is called on click
      >
        Save Changes
      </Button>
    </>
  ) : (
    <>
      <Typography variant="body1" sx={{ color: "#555", marginTop: 1 }}>
        {content}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
    </>
  )}
</CardContent>
</Dialog>
{/* Post Content */}
<CardContent>
        <Typography variant="body1" sx={{ color: "#555" }}>
          {content}
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between",  }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
  onClick={handleLike}
  sx={{
    color: tempLike || likes.includes(currentUser.name) ? "#FF2A59" : "gray",
    transition: "transform 0.2s",
    "&:hover": { transform: "scale(1.2)" },
  }}
  disabled={loadingLike}
>
  {loadingLike ? <CircularProgress size={24} color="primary" /> : <FavoriteIcon />}
</IconButton>

        <Typography variant="body2">{likeCount} Likes</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleOpenComments}
            sx={{ color: "gray", transition: "transform 0.2s", "&:hover": { transform: "scale(1.2)" } }}
          >
            <CommentIcon />
          </IconButton>
          <Typography variant="body2">{commentCount} Comments</Typography>
        </Box>
      </CardActions>

      <Dialog open={showComments} onClose={() => setShowComments(false)} ref={dialogRef}>
        
        <DialogContent>
          <CommentSection postId={postId} />
        </DialogContent>
      </Dialog>

      {/* 3-Dot Menu for Edit/Delete */}
      <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
>
  {isOwner && [
    <MenuItem key="edit" onClick={() => setEditing(true)}>Edit</MenuItem>,
    <MenuItem key="delete" onClick={handleDeletePost}>Delete</MenuItem>
  ]}
  {!isOwner && <MenuItem disabled>Unauthorized</MenuItem>}
</Menu>


    </Card>
  );
};

PostCard.propTypes = {
  postId: PropTypes.string.isRequired,
  user: PropTypes.string,
  content: PropTypes.string,
  userId: PropTypes.string.isRequired,
  avatar: PropTypes.string,
};

export default PostCard; 