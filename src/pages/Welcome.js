import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Welcome = () => {
  const textRef = useRef(null);

  useEffect(() => {
    const paths = textRef.current.querySelectorAll(".path");

    gsap.set(paths, { strokeDasharray: 400, strokeDashoffset: 400 });

    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power2.inOut",
      stagger: 0.3,
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <div className="flex h-screen w-full justify-center items-center bg-[#35dad2]">
      <h3>
        <svg width="20em" height="auto" viewBox="0 0 800 200" ref={textRef}>
          {/* Define Gradient for Stroke */}
          <defs>
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0080" />
              <stop offset="100%" stopColor="#8000ff" />
            </linearGradient>
          </defs>

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fontSize="70"
            fontFamily="'Lobster', cursive"
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="4"
          >
            <tspan x="50%" dy="-10" className="path">Welcome to</tspan>
            <tspan x="50%" dy="1.2em" className="path">MeetHub!</tspan>
          </text>
        </svg>
      </h3>

      {/* Load Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default Welcome;
