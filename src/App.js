import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MemeDetails from "./pages/MemeDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Trending from "./pages/Trending";
import Header from "./components/Header";
import "./styles/custom.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
      } catch (err) {
        console.error("Error parsing user data:", err);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (data) => {
    const { user, token } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser({ ...user, token });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/meme/:id" element={<MemeDetails user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<Upload user={user} />} />
          <Route path="/saved" element={<Saved user={user} />} />
          <Route path="/profile/:username" element={<Profile user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
