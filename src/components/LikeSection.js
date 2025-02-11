// import React, { useState, useEffect } from "react";
// import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import axios from "axios";

// const LikeSection = ({ postId, onNewLike }) => {
//   const [likes, setLikes] = useState([]); // Store the list of users who liked the post
//   const [isLiked, setIsLiked] = useState(false); // Track if the user has liked the post
//   const [loading, setLoading] = useState(false); // Loading state for like/unlike action
//   const [error, setError] = useState(""); // Error state

//   // Fetch post details to get like count and user's like status
//   useEffect(() => {
//     const fetchPostDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
//         setLikes(response.data.likes); // Set the array of users who liked
//         const userPostId = localStorage.getItem("userpostId"); // Get the user postId from localStorage
//         setIsLiked(response.data.likes.some((user) => user._postId === userPostId)); // Check if the current user has liked the post
//       } catch (error) {
//         setError("Failed to fetch likes");
//         console.error("Failed to fetch post details", error);
//       }
//     };

//     fetchPostDetails();
//   }, [postId]);

//   // Handle like/unlike action
//   // Example of logging the URL and postId
//   const handleLike = async () => {
//     if (loadingLike) return;
//     setLoadingLike(true);
//     setError(""); // Clear previous errors
  
//     try {
//       const token = localStorage.getItem("userToken");
//       if (!token) {
//         throw new Error("User token is missing. Please log in.");
//       }
  
//       // Use PUT instead of POST
//       const url = liked
//         ? `http://localhost:5000/api/posts/${postId}/unlike`
//         : `http://localhost:5000/api/posts/${postId}/like`;
  
//       const response = await axios.put(
//         url,
//         {}, // No request body required
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
  
//       if (response.data && Array.isArray(response.data.likes)) {
//         setLikeCount(response.data.likes.length);
//         setLiked(!liked);
//       } else {
//         throw new Error("Invalid response from the server.");
//       }
//     } catch (err) {
//       setError(err.message || "Unable to update like status.");
//       console.error(err);
//     } finally {
//       setLoadingLike(false);
//     }
//   };
  

//   return (
//     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//       <IconButton onClick={handleLike} color="primary" disabled={loading}>
//         {loading ? (
//           <CircularProgress size={24} color="primary" />
//         ) : isLiked ? (
//           <FavoriteIcon color="error" />
//         ) : (
//           <FavoriteBorderIcon />
//         )}
//       </IconButton>
//       <Typography variant="body2">
//         {likes.length} {likes.length === 1 ? "Like" : "Likes"}
//       </Typography>

//       {error && (
//         <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
//           {error}
//         </Typography>
//       )}
//     </Box>
//   );
// };

// export default LikeSection;
