import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import {
  FaRegComment,
  FaShare,
  FaEllipsisH,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { likeMeme } from "../api";
import VideoPlayer from "./VideoPlayer";

export default function MemeCard({ meme, user, onVideoPlay, playingVideoId }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(meme.likes?.length || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && meme.likes) {
      const hasLiked = meme.likes.some((id) => String(id) === String(user._id));
      setIsLiked(hasLiked);
    }

    if (user) {
      // Check if meme is saved (user-specific storage)
      const savedMemesKey = `savedMemes_${user._id}`;
      const savedMemes = JSON.parse(
        localStorage.getItem(savedMemesKey) || "[]"
      );
      setIsSaved(savedMemes.includes(meme._id));

      // Also store in liked memes if user has liked it
      if (
        meme.likes &&
        meme.likes.some((id) => String(id) === String(user._id))
      ) {
        const likedMemesKey = `likedMemes_${user._id}`;
        const likedMemes = JSON.parse(
          localStorage.getItem(likedMemesKey) || "[]"
        );
        if (!likedMemes.includes(meme._id)) {
          likedMemes.push(meme._id);
          localStorage.setItem(likedMemesKey, JSON.stringify(likedMemes));
        }
      }
    }
  }, [meme.likes, user, meme._id]);

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
      const likedMemesKey = `likedMemes_${user._id}`;
      const likedMemes = JSON.parse(
        localStorage.getItem(likedMemesKey) || "[]"
      );
      if (!likedMemes.includes(meme._id)) {
        const newLikedMemes = [...likedMemes, meme._id];
        localStorage.setItem(likedMemesKey, JSON.stringify(newLikedMemes));
      }

      try {
        await likeMeme(meme._id, user.token);
      } catch (err) {
        console.error("Like failed:", err);
        setIsLiked(false);
        setLikeCount(likeCount);
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
      newSavedMemes = savedMemes.filter((id) => id !== meme._id);
    } else {
      newSavedMemes = [...savedMemes, meme._id];
    }

    localStorage.setItem(savedMemesKey, JSON.stringify(newSavedMemes));
    setIsSaved(!isSaved);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    if (!isLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 600);
    }

    // Update liked memes in localStorage with user-specific key
    const likedMemesKey = `likedMemes_${user._id}`;
    const likedMemes = JSON.parse(localStorage.getItem(likedMemesKey) || "[]");
    let newLikedMemes;

    if (wasLiked) {
      newLikedMemes = likedMemes.filter((id) => id !== meme._id);
    } else {
      newLikedMemes = [...likedMemes, meme._id];
    }

    localStorage.setItem(likedMemesKey, JSON.stringify(newLikedMemes));

    try {
      const { data } = await likeMeme(meme._id, user.token);
      setLikeCount(data.likes?.length || 0);
    } catch (err) {
      // Revert changes on error
      setIsLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount + 1 : likeCount - 1);
      console.error("Error liking meme:", err);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: meme.title || "Check out this meme!",
        url: `${window.location.origin}/meme/${meme._id}`,
      });
    } catch (err) {
      navigator.clipboard.writeText(
        `${window.location.origin}/meme/${meme._id}`
      );
      alert("Link copied to clipboard!");
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/meme/${meme._id}`);
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    navigate(`/meme/${meme._id}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now - past) / 60000);

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  return (
    <article className="bg-white border border-gray-200 mb-4 sm:mb-6 max-w-lg mx-auto rounded-none sm:rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
            <img
              src={
                meme.author?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${
                  meme.author?.username || "A"
                }&background=f3f4f6&color=6b7280&size=40`
              }
              alt={meme.author?.username || "Anonymous"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-semibold text-black">
              {meme.author?.username || "Anonymous"}
            </span>
          </div>
        </div>
        <button
          onClick={handleOptionsClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaEllipsisH className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Media */}
      <div
        className={`relative ${meme.aspectRatio === "reel" ? "reel-container" : "bg-black aspect-square"} cursor-pointer select-none`}
        onDoubleClick={handleDoubleClick}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}

        {meme.mediaType === "video" ? (
          <VideoPlayer
            src={meme.mediaUrl}
            memeId={meme._id}
            shouldPlay={playingVideoId === meme._id}
            onPlay={() => onVideoPlay && onVideoPlay(meme._id)}
            className="w-full h-full"
          />
        ) : (
          <img
            src={meme.mediaUrl}
            alt={meme.title || "Meme"}
            onLoad={handleImageLoad}
            className={`w-full h-full ${meme.aspectRatio === "reel" ? "" : "object-cover"} transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />
        )}

        {/* Double-click heart burst animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative">
              <AiFillHeart className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg animate-bounce" />
              {/* Heart particles */}
              <div className="absolute inset-0 animate-ping">
                <AiFillHeart className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4" />
                <AiFillHeart className="w-4 h-4 sm:w-6 sm:h-6 text-pink-400 absolute top-2 right-0 transform translate-x-4" />
                <AiFillHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 absolute bottom-2 left-0 transform -translate-x-4" />
                <AiFillHeart className="w-5 h-5 sm:w-7 sm:h-7 text-pink-500 absolute bottom-0 right-2 transform translate-x-2 translate-y-4" />
              </div>
            </div>
          </div>
        )}

        {/* Single click like animation */}
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AiFillHeart className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 animate-pulse opacity-80" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={handleLike}
              className="hover:scale-110 transition-all duration-200 active:scale-95 p-1"
            >
              {isLiked ? (
                <AiFillHeart className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              ) : (
                <AiOutlineHeart className="w-6 h-6 sm:w-7 sm:h-7 text-black hover:text-gray-600" />
              )}
            </button>
            <button
              onClick={handleCommentClick}
              className="hover:scale-110 transition-all duration-200 active:scale-95 p-1"
            >
              <FaRegComment className="w-6 h-6 sm:w-7 sm:h-7 text-black hover:text-gray-600" />
            </button>
            <button
              onClick={handleShare}
              className="hover:scale-110 transition-all duration-200 active:scale-95 p-1"
            >
              <FaShare className="w-6 h-6 sm:w-7 sm:h-7 text-black hover:text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="hover:scale-110 transition-all duration-200 active:scale-95 p-1"
          >
            {isSaved ? (
              <FaBookmark className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
            ) : (
              <FaRegBookmark className="w-6 h-6 sm:w-7 sm:h-7 text-black hover:text-gray-600" />
            )}
          </button>
        </div>

        {/* Likes */}
        {likeCount > 0 && (
          <div className="mb-2">
            <span className="text-sm font-semibold text-black">
              {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
            </span>
          </div>
        )}

        {/* Caption */}
        {meme.title && (
          <div className="mb-2">
            <span className="text-sm">
              <span className="font-semibold text-black mr-2">
                {meme.author?.username || "Anonymous"}
              </span>
              <span className="text-black">{meme.title}</span>
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {meme.createdAt ? formatTimeAgo(meme.createdAt) : "now"}
        </div>
      </div>
    </article>
  );
}
