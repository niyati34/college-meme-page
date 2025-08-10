import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMeme } from "../api";
import { FaHeart, FaBookmark, FaArrowLeft, FaPlay } from "react-icons/fa";

export default function Saved({ user }) {
  const [savedMemes, setSavedMemes] = useState([]);
  const [likedMemes, setLikedMemes] = useState([]);
  const [activeTab, setActiveTab] = useState("saved");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchSavedAndLikedMemes();
  }, [user, navigate]);

  const fetchSavedAndLikedMemes = async () => {
    setLoading(true);

    try {
      // Get saved memes from localStorage (user-specific)
      const savedMemesKey = `savedMemes_${user._id}`;
      const savedMemeIds = JSON.parse(
        localStorage.getItem(savedMemesKey) || "[]"
      );
      const savedMemePromises = savedMemeIds.map((id) => fetchMeme(id));
      const savedMemeResults = await Promise.allSettled(savedMemePromises);
      const validSavedMemes = savedMemeResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.data);

      setSavedMemes(validSavedMemes);

      // Get liked memes from localStorage (user-specific)
      const likedMemesKey = `likedMemes_${user._id}`;
      const likedMemeIds = JSON.parse(
        localStorage.getItem(likedMemesKey) || "[]"
      );
      const likedMemePromises = likedMemeIds.map((id) => fetchMeme(id));
      const likedMemeResults = await Promise.allSettled(likedMemePromises);
      const validLikedMemes = likedMemeResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.data);

      setLikedMemes(validLikedMemes);
    } catch (error) {
      console.error("Error fetching saved memes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemeClick = (memeId) => {
    navigate(`/meme/${memeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton - Instagram style */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="w-6 h-6 rounded-full animate-shimmer"></div>
            <div className="w-32 h-6 rounded-lg animate-shimmer"></div>
            <div className="w-6 h-6"></div>
          </div>

          {/* Tabs skeleton - Instagram style */}
          <div className="flex border-b border-gray-200 py-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded animate-shimmer"></div>
                <div className="w-14 h-5 rounded animate-shimmer"></div>
                <div className="w-6 h-5 rounded-full animate-shimmer"></div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded animate-shimmer"></div>
                <div className="w-14 h-5 rounded animate-shimmer"></div>
                <div className="w-6 h-5 rounded-full animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Grid skeleton - Instagram style */}
          <div className="p-1 sm:p-2">
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {[...Array(12)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-shimmer rounded-sm overflow-hidden"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMemes = activeTab === "saved" ? savedMemes : likedMemes;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-black">
            {user.username || "Your Collection"}
          </h1>
          <div className="w-9" />
        </div>

        {/* Minimalistic Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
              activeTab === "saved"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaBookmark
                className={`w-4 h-4 ${
                  activeTab === "saved" ? "text-black" : ""
                }`}
              />
              <span className="text-sm sm:text-base">Saved</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {savedMemes.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
              activeTab === "liked"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaHeart
                className={`w-4 h-4 ${
                  activeTab === "liked" ? "text-red-500" : ""
                }`}
              />
              <span className="text-sm sm:text-base">Liked</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {likedMemes.length}
              </span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-1">
          {currentMemes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mb-6">
                {activeTab === "saved" ? (
                  <FaBookmark className="w-16 h-16 text-gray-300 mx-auto" />
                ) : (
                  <FaHeart className="w-16 h-16 text-gray-300 mx-auto" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {activeTab === "saved"
                  ? "No saved posts yet"
                  : "No liked posts yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {activeTab === "saved"
                  ? "Save posts you want to see again by tapping the bookmark icon."
                  : "Posts you like will appear here. Start exploring!"}
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Explore Posts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {currentMemes.map((meme) => (
                <div
                  key={meme._id}
                  onClick={() => handleMemeClick(meme._id)}
                  className="aspect-square bg-gray-100 cursor-pointer relative group overflow-hidden"
                >
                  <img
                    src={meme.mediaUrl}
                    alt={meme.title || "Saved meme"}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />

                  {/* Minimal overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center space-x-1 text-xs font-semibold">
                        <FaHeart className="w-3 h-3" />
                        <span>{meme.likes?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Video indicator */}
                  {meme.mediaType === "video" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                        <FaPlay className="w-2 h-2 text-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Multiple images indicator (if needed later) */}
                  {meme.mediaCount > 1 && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats footer */}
        {currentMemes.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-500">
              {currentMemes.length} {activeTab === "saved" ? "saved" : "liked"}{" "}
              post{currentMemes.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
