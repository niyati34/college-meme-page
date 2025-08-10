import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaHome, FaSearch, FaBookmark } from "react-icons/fa";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-black">
            MemeVerse
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4 lg:mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/" className="hover:opacity-50 transition-opacity p-2">
              <FaHome className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </Link>

            {/* Search icon for mobile */}
            <button className="md:hidden hover:opacity-50 transition-opacity p-2">
              <FaSearch className="w-5 h-5 text-black" />
            </button>

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
              <div className="flex items-center space-x-2 sm:space-x-4">
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
                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-gray-600 hover:text-black hidden sm:block"
                >
                  Logout
                </button>
                {/* Mobile logout */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden text-xs text-gray-600 hover:text-black p-1"
                >
                  Exit
                </button>
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
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
