import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaHome, FaSearch, FaBookmark, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-black">
            MemeVerse
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/" className="hover:opacity-50 transition-opacity p-2">
              <FaHome className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </Link>

            {user && user.role === "admin" && (
              <Link
                to="/upload"
                className="hover:opacity-50 transition-opacity p-2"
              >
                <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </Link>
            )}

            {user && (
              <Link
                to="/saved"
                className="hover:opacity-50 transition-opacity p-2"
              >
                <FaBookmark className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${
                          user.username || "U"
                        }&background=f3f4f6&color=6b7280&size=32`
                      }
                      alt={user.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <FaChevronDown className="w-3 h-3 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FaUser className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/saved"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FaBookmark className="w-4 h-4" />
                      <span>Saved Memes</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 font-semibold px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
