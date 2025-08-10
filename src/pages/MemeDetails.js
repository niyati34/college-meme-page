import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import {
  FaRegComment,
  FaShare,
  FaArrowLeft,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaEllipsisH,
} from "react-icons/fa";
import { fetchMeme, likeMeme, deleteMeme } from "../api";
import CommentSection from "../components/CommentSection";
import VideoPlayer from "../components/VideoPlayer";

export default function MemeDetails({ user }) {
  const [meme, setMeme] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemeData = async () => {
      try {
        console.log("Fetching meme details for ID:", id);
        setLoading(true);
        setError(null);

        const { data } = await fetchMeme(id);
        console.log("Received meme data:", data);

        if (!data) {
          throw new Error("No meme data received");
        }

        setMeme(data);
        setLikeCount(data.likes?.length || 0);

        if (user && data.likes) {
          const hasLiked = data.likes.some(
            (likeId) => String(likeId) === String(user._id)
          );
          setIsLiked(hasLiked);
        }

        // Check if meme is saved (user-specific)
        if (user) {
          const savedMemesKey = `savedMemes_${user._id}`;
          const savedMemes = JSON.parse(
            localStorage.getItem(savedMemesKey) || "[]"
          );
          setIsSaved(savedMemes.includes(data._id));
        }
      } catch (err) {
        console.error("Error fetching meme:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to load meme";
        setError(errorMessage);
        setMeme(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemeData();
    } else {
      setError("No meme ID provided");
      setLoading(false);
    }
  }, [id, user]);

  const handleDoubleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isLiked) {
      setShowHeartBurst(true);
      setIsLiked(true);
      setLikeCount(likeCount + 1);

      // Add to liked memes in localStorage
      const likedMemes = JSON.parse(localStorage.getItem("likedMemes") || "[]");
      if (!likedMemes.includes(id)) {
        const newLikedMemes = [...likedMemes, id];
        localStorage.setItem("likedMemes", JSON.stringify(newLikedMemes));
      }

      try {
        await likeMeme(id, user.token);
      } catch (err) {
        console.error("Like failed:", err);
        setIsLiked(false);
        setLikeCount(likeCount);

        // Revert localStorage change
        const revertedLikedMemes = likedMemes.filter((memeId) => memeId !== id);
        localStorage.setItem("likedMemes", JSON.stringify(revertedLikedMemes));
      }

      setTimeout(() => {
        setShowHeartBurst(false);
      }, 1000);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    const savedMemesKey = `savedMemes_${user._id}`;
    const savedMemes = JSON.parse(localStorage.getItem(savedMemesKey) || "[]");
    let newSavedMemes;

    if (isSaved) {
      newSavedMemes = savedMemes.filter((savedId) => savedId !== id);
    } else {
      newSavedMemes = [...savedMemes, id];
    }

    localStorage.setItem(savedMemesKey, JSON.stringify(newSavedMemes));
    setIsSaved(!isSaved);
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    // Update liked memes in localStorage
    const likedMemes = JSON.parse(localStorage.getItem("likedMemes") || "[]");
    let newLikedMemes;

    if (wasLiked) {
      newLikedMemes = likedMemes.filter((memeId) => memeId !== id);
    } else {
      newLikedMemes = [...likedMemes, id];
    }

    localStorage.setItem("likedMemes", JSON.stringify(newLikedMemes));

    try {
      const { data } = await likeMeme(id, user.token);
      setLikeCount(data.likes?.length || 0);
    } catch (err) {
      console.error("Error liking meme:", err);
      // Revert changes on error
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1);

      const revertedLikedMemes = wasLiked
        ? [...likedMemes, id]
        : likedMemes.filter((memeId) => memeId !== id);
      localStorage.setItem("likedMemes", JSON.stringify(revertedLikedMemes));

      alert("Failed to update like. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: "Check out this meme!",
        text: meme.title || "Funny meme from MemeVerse",
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      alert("Failed to share meme");
    }
  };

  const handleDeleteMeme = async () => {
    if (!user || user.role !== "admin") {
      alert("Admin access required!");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this meme? This action cannot be undone and will also delete all comments."
      )
    ) {
      return;
    }

    try {
      await deleteMeme(id, user.token);

      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className =
        "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300";
      successMsg.textContent = "Meme deleted successfully!";
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.classList.add("opacity-0", "translate-x-full");
        setTimeout(() => document.body.removeChild(successMsg), 300);
      }, 2000);

      // Navigate back to home after a short delay
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Error deleting meme:", err);
      alert("Failed to delete meme. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto">
          {/* Header skeleton - Instagram style */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full animate-shimmer"></div>
            <div className="w-20 sm:w-24 h-6 rounded-lg animate-shimmer"></div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full animate-shimmer"></div>
          </div>

          {/* Post header skeleton - Instagram style */}
          <div className="flex items-center p-3 sm:p-4 space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-shimmer"></div>
            <div className="w-24 sm:w-32 h-5 rounded-lg animate-shimmer"></div>
          </div>

          {/* Media skeleton - Instagram style with logo overlay */}
          <div className="aspect-square animate-shimmer relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-white rounded-xl opacity-30"></div>
            </div>
          </div>

          {/* Actions skeleton - Instagram style */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
              </div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="w-24 h-5 rounded-lg animate-shimmer"></div>
              <div className="flex space-x-2 items-center">
                <div className="w-24 h-5 rounded-lg animate-shimmer"></div>
                <div className="w-full h-5 rounded-lg animate-shimmer"></div>
              </div>
              <div className="w-32 h-4 rounded-lg animate-shimmer"></div>
            </div>

            {/* Comments skeleton */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full animate-shimmer"></div>
                <div className="flex-1 h-14 rounded-lg animate-shimmer"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full animate-shimmer"></div>
                <div className="flex-1 h-10 rounded-lg animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto pt-16">
          <div className="text-center px-4">
            <div className="text-6xl mb-6">�</div>
            <h2 className="text-xl font-semibold text-black mb-2">
              Sorry, this page isn't available.
            </h2>
            <p className="text-gray-500 mb-8">
              The link you followed may be broken, or the page may have been
              removed.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-blue-500 font-semibold hover:text-blue-700"
            >
              Go back to MemeVerse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-black">
            Post
          </h1>
          <div className="w-8 sm:w-9" />
        </div>

        {/* Post */}
        <article className="bg-white">
          {/* Post Header */}
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden">
                <img
                  src={
                    meme.author?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${
                      meme.author?.username || "A"
                    }&background=f3f4f6&color=6b7280&size=32`
                  }
                  alt={meme.author?.username || "Anonymous"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-sm sm:text-base font-semibold text-black">
                  {meme.author?.username || "Anonymous"}
                </span>
              </div>
            </div>
            {user && user.role === "admin" ? (
              <button
                onClick={handleDeleteMeme}
                className="p-1 sm:p-2 text-red-500 hover:text-red-700 transition-colors focus:outline-none"
              >
                <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button className="p-1 sm:p-2">
                <FaEllipsisH className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Media */}
          <div
            className="relative bg-black aspect-square cursor-pointer select-none"
            onDoubleClick={handleDoubleClick}
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          >
            {meme.mediaType === "video" ? (
              <VideoPlayer
                src={meme.mediaUrl}
                memeId={meme._id}
                shouldPlay={true}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={meme.mediaUrl}
                alt={meme.title || "Meme"}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}

            {/* Double-click heart burst animation */}
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative">
                  <AiFillHeart className="w-20 h-20 text-white drop-shadow-lg animate-bounce" />
                  <div className="absolute inset-0 animate-ping">
                    <AiFillHeart className="w-8 h-8 text-red-400 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4" />
                    <AiFillHeart className="w-6 h-6 text-pink-400 absolute top-2 right-0 transform translate-x-4" />
                    <AiFillHeart className="w-5 h-5 text-red-300 absolute bottom-2 left-0 transform -translate-x-4" />
                    <AiFillHeart className="w-7 h-7 text-pink-500 absolute bottom-0 right-2 transform translate-x-2 translate-y-4" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleLike}
                  className="hover:scale-110 transition-all duration-200 active:scale-95"
                >
                  {isLiked ? (
                    <AiFillHeart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  ) : (
                    <AiOutlineHeart className="w-5 h-5 sm:w-6 sm:h-6 text-black hover:text-gray-600" />
                  )}
                </button>
                <button className="hover:scale-110 transition-all duration-200 active:scale-95">
                  <FaRegComment className="w-5 h-5 sm:w-6 sm:h-6 text-black hover:text-gray-600" />
                </button>
                <button
                  onClick={handleShare}
                  className="hover:scale-110 transition-all duration-200 active:scale-95"
                >
                  <FaShare className="w-5 h-5 sm:w-6 sm:h-6 text-black hover:text-gray-600" />
                </button>
              </div>
              <button
                onClick={handleSave}
                className="hover:scale-110 transition-all duration-200 active:scale-95"
              >
                {isSaved ? (
                  <FaBookmark className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                ) : (
                  <FaRegBookmark className="w-5 h-5 sm:w-6 sm:h-6 text-black hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Likes */}
            {likeCount > 0 && (
              <div className="mb-2">
                <span className="text-sm sm:text-base font-semibold text-black">
                  {likeCount.toLocaleString()}{" "}
                  {likeCount === 1 ? "like" : "likes"}
                </span>
              </div>
            )}

            {/* Caption */}
            {meme.title && (
              <div className="mb-2">
                <span className="text-sm sm:text-base">
                  <span className="font-semibold text-black mr-2">
                    {meme.author?.username || "Anonymous"}
                  </span>
                  <span className="text-black">{meme.title}</span>
                </span>
              </div>
            )}

            {/* Time */}
            <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
              {new Date(meme.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200">
            <CommentSection memeId={id} user={user} />
          </div>
        </article>
      </div>
    </div>
  );
}
