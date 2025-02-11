import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Chat from "./components/Chat";
import ProfileList from "./components/ProfileList";
import Loader from "./pages/Loader";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 5 seconds, then remove it
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <GlobalStyles />
      {loading ? (
        <Loader /> // Show loader for 5 seconds
      ) : (
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Login />} />
            <Route path="/profilelist" element={<ProfileList />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      )}
    </>
  );
};

export default App;
