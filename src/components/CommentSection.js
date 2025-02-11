import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

const CommentSection = ({ postId, onNewComment }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('Received postId:', postId); // Log the postId to verify it's correct
    const fetchComments = async () => {
      if (!postId || typeof postId !== "string") {
        console.error("Invalid postId");
        setError("Invalid postId");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
        setComments(response.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch comments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    const tempComment = {
      user: { name: "You" },
      comment: newComment.trim(),
    };

    setComments((prev) => [tempComment, ...prev]); // Optimistic update
    setNewComment("");

    try {
      const token = localStorage.getItem("userToken");
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError("");
      
    } catch (err) {
      setError("Failed to add comment");
      console.error(err);
      setComments((prev) => prev.filter((c) => c !== tempComment)); // Revert optimistic update
    }
  };

  return (
    <Box
      sx={{
        marginTop: 3,
        padding: 3,
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        background: "white",
        color: "white",
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          marginBottom: 2, 
          fontWeight: "bold", 
          textAlign: "center",
          letterSpacing: "1px" ,
          color: 'Gray'
        }}
      >
        Comments
      </Typography>
  
      {loading && <CircularProgress size={24} sx={{ marginBottom: 2, color: "white" }} />}
      {error && (
        <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
  
      <Box sx={{ maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}>
        {comments.length === 0 ? (
          <Typography variant="body2" sx={{ marginBottom: 2, textAlign: "center" }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          comments.map((comment, index) => (
            <Box
              key={index}
              sx={{
                marginBottom: 2,
                padding: 2,
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(5px)",
                transition: "all 0.3s ease-in-out",
                "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold", color: " #FF6F61" }}>
                {comment.user?.name || "Anonymous"}:
              </Typography>
              <Typography variant="body2" sx={{color: 'black'}}>{comment.comment}</Typography>
            </Box>
          ))
        )}
      </Box>
  
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        error={Boolean(error)}
        helperText={error && newComment.trim() === "" ? "Comment cannot be empty" : ""}
        sx={{
          marginTop: 2,
          background: "#fff",
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#1E3C72" },
            "&:hover fieldset": { borderColor: "#FF6F61" },
          },
        }}
      />
  
      <Button
        variant="contained"
        onClick={handleComment}
        disabled={loading}
        sx={{
          marginTop: 2,
          background: "linear-gradient(45deg, #FF6F61, #FF8E53)",
          color: "white",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "8px 16px",
          width: "100%",
          transition: "transform 0.3s ease-in-out",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        {loading ? "Posting..." : "Comment"}
      </Button>
    </Box>
  );
  
};

export default CommentSection;
