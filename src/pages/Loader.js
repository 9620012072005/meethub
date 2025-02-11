import React, { useEffect, useRef } from "react";
import Particles from "@tsparticles/react";
import gsap from "gsap";
import Welcome from "../pages/Welcome"; // Import the Welcome component
import { Box } from "@mui/material";
import {
  FaHeart,
  FaComment,
  FaPaperPlane,
  FaUser,
  FaComments,
  FaThumbsUp,
  FaStar,
  FaBell,
 
  FaSmile,
} from "react-icons/fa"; // Added More Icons

const Loader = () => {
  const loaderRef = useRef(null);
  const iconRefs = useRef([]);

  useEffect(() => {
    // Rotate Loader
    gsap.to(loaderRef.current, {
      rotation: 360,
      repeat: -1,
      duration: 1.5,
      ease: "linear",
    });

    // Floating Animation for Icons
    iconRefs.current.forEach((icon) => {
      gsap.to(icon, {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: "sine.inOut",
      });
    });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom right, #FEAC5E, #C779D0, #4BC0C8)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Welcome Component - Positioned Above Logo */}
      <Box sx={{ marginBottom: "20px", marginTop: "0px" }}>
        <Welcome />
      </Box>

      {/* Background Particles */}
      <Particles
        id="particles"
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 80 },
            size: { value: 2 },
            move: { speed: 1, direction: "none", random: true, outModes: "bounce" },
            color: { value: "#ffffff" },
          },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Floating Social Media Icons - Added More Icons */}
      {[
        { icon: <FaHeart />, top: "10%", left: "20%" },
        { icon: <FaComment />, top: "30%", left: "80%" },
        { icon: <FaPaperPlane />, top: "30%", left: "10%" },
        { icon: <FaUser />, top: "70%", left: "70%" },
        { icon: <FaComments />, top: "85%", left: "40%" },
        { icon: <FaThumbsUp />, top: "15%", left: "60%" },
        { icon: <FaStar />, top: "45%", left: "90%" },
        { icon: <FaBell />, top: "65%", left: "20%" },
        
        { icon: <FaSmile />, top: "80%", left: "10%" },
      ].map((item, index) => (
        <Box
          key={index}
          ref={(el) => (iconRefs.current[index] = el)}
          sx={{
            position: "absolute",
            top: item.top,
            left: item.left,
            fontSize: "30px",
            color: "rgba(255, 255, 255, 0.3)", // Semi-transparent
            animation: "float 6s infinite ease-in-out",
          }}
        >
          {item.icon}
        </Box>
      ))}

      {/* Centered Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {/* Circular Loader with Logo */}
        <Box sx={{ position: "relative", width: "90px", height: "90px" }}>
          {/* Thin Circular Loader */}
          <Box
            ref={loaderRef}
            sx={{
              position: "absolute",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTop: "2px solid #ffffff",
              borderBottom: "2px solid #ffffff",
              animation: "spin 1.5s linear infinite",
            }}
          />

          {/* Centered Logo */}
          <Box
            component="img"
            src="/assets/meethub.png"
            alt="MeetUp Logo"
            sx={{
              width: "50px",
              height: "50px",
              
              
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              
            }}
          />
        </Box>
      </Box>

      {/* CSS Keyframes for Floating Icons */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Loader;
