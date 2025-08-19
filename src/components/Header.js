import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaHome,
  FaSearch,
  FaBookmark,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    onLogout();
    navigate("/");
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-lg">MemeVerse</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800"
              aria-label="Home"
            >
              <FaHome className="w-5 h-5" />
            </Link>

            {!user ? (
              <>
                <Link to="/login" className="text-blue-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/upload"
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    Upload
                  </Link>
                )}
                <Link
                  to={`/profile/${user.username || "me"}`}
                  className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  <FaUser className="w-4 h-4" />
                  <span>{user.username || "Profile"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
