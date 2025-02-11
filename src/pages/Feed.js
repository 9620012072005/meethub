import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import axios from "axios";
import gsap from "gsap";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const postListRef = useRef(null);

  // Fetch posts from the database
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts"); // Adjust URL as needed
        setPosts(response.data);
        animatePosts();
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Animate posts on load
  const animatePosts = () => {
    if (postListRef.current) {
      gsap.fromTo(
        postListRef.current.children,
        { opacity: 1, y: 50 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 2, ease: "power4.out" }
      );
    }
  };

  // Handle dialog open/close
  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => {
    setOpen(false);
    setNewPostContent("");
    setNewPostImage(null);
    setImagePreview(null);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!newPostContent.trim() && !newPostImage) {
      console.error("Post content or image is required.");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("User is not authenticated.");
        return;
      }

      const formData = new FormData();
      formData.append("content", newPostContent);
      if (newPostImage) {
        formData.append("image", newPostImage);
      }

      const response = await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts([response.data, ...posts]); // Update post list with the new post
      handleDialogClose();
      animatePosts();
    } catch (error) {
      console.error("Failed to add post:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ position: "relative", padding: 3 }}>
        {/* Add Post Button */}
        <IconButton
          onClick={handleDialogOpen}
          sx={{
            position: "absolute",
            zIndex: 1200,
            top: 16,
            right: 15,
            background: "linear-gradient(135deg,  #51EEE0, #1897B5, #FF5253 )",
            color: "white",
            boxShadow: "0px 4px 12px rgba(255, 111, 97, 0.6)",
            transform: "scale(1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #FF8E53, #FF6F61)",
              boxShadow: "0px 6px 15px rgba(255, 111, 97, 0.8)",
              transform: "scale(1.1)",
            },
          }}
        >
          <AddIcon fontSize="large" />
        </IconButton>

        {/* Post List */}
        <Grid container spacing={2} ref={postListRef}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard
                key={post._id} // Ensure unique post ID from MongoDB
                postId={post._id} // Pass the correct postId here
                user={post.user?.name || "Anonymous"} // Default to "Anonymous" if user name is not available
                content={post.content}
                image={post.image} // Display the post image
              />
            </Grid>
          ))}
        </Grid>

        {/* Add Post Dialog */}
        <Dialog 
  open={open} 
  onClose={handleDialogClose} 
  maxWidth="sm" 
  fullWidth
  sx={{
    "& .MuiPaper-root": {
      borderRadius: "12px",
      background: "white",
      color: "white",
      padding: "20px",
    },
  }}
>
  <DialogTitle 
    sx={{ 
      fontWeight: "bold", 
      textAlign: "center", 
      fontSize: "22px", 
      letterSpacing: "1px", 
      color: "black",
    }}
  >
    Add a New Post
  </DialogTitle>
  
  <DialogContent>
    <TextField
      fullWidth
      multiline
      rows={4}
      variant="outlined"
      label="What's on your mind?"
      value={newPostContent}
      onChange={(e) => setNewPostContent(e.target.value)}
      sx={{
        background: "#fff",
        borderRadius: "8px",
        "& label": { color: "#1E3C72" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#1E3C72" },
          "&:hover fieldset": { borderColor: "#FF6F61" },
        },
        marginTop: 2,
      }}
    />

    <Box 
      sx={{
        marginTop: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed #FF6F61",
        borderRadius: "8px",
        padding: "12px",
        cursor: "pointer",
        "&:hover": { backgroundColor: "rgba(255, 111, 97, 0.1)" },
        transition: "all 0.3s ease-in-out",
      }}
    >
      <input 
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="upload-image"
      />
      <label htmlFor="upload-image" style={{ cursor: "pointer" }}>
        <Button 
          component="span"
          sx={{
            background: "linear-gradient(45deg, #FF6F61, #FF8E53)",
            color: "white",
            fontWeight: "bold",
            padding: "6px 12px",
            borderRadius: "8px",
            "&:hover": { transform: "scale(1.05)", transition: "0.3s ease-in-out" },
          }}
        >
          Upload Image
        </Button>
      </label>
    </Box>

    {imagePreview && (
      <Box
        component="img"
        src={imagePreview}
        alt="Preview"
        sx={{
          marginTop: 2,
          maxWidth: "100%",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(255, 111, 97, 0.6)",
          transition: "transform 0.3s ease-in-out",
          "&:hover": { transform: "scale(1.03)" },
        }}
      />
    )}
  </DialogContent>
  
  <DialogActions sx={{ justifyContent: "center", marginBottom: "10px" }}>
    <Button 
      onClick={handleDialogClose} 
      sx={{
        background: "linear-gradient(45deg, #6A11CB, #2575FC)",
        color: "white",
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "8px 16px",
        "&:hover": { transform: "scale(1.05)", transition: "0.3s ease-in-out" },
      }}
    >
      Cancel
    </Button>
    
    <Button 
      onClick={handleSubmit}
      sx={{
        background: "linear-gradient(45deg, #FF6F61, #FF8E53)",
        color: "white",
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "8px 16px",
        "&:hover": { transform: "scale(1.05)", transition: "0.3s ease-in-out" },
      }}
    >
      Post
    </Button>
  </DialogActions>
</Dialog>

      </Box>
    </>
  );
};

export default Feed;  