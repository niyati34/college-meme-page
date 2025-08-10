import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaShare, FaEllipsisH } from "react-icons/fa";
import { likeMeme } from "../api";
import VideoPlayer from "./VideoPlayer";

export default function MemeCard({ meme, user, onVideoPlay, playingVideoId }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(meme.likes?.length || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && meme.likes) {
      const hasLiked = meme.likes.some((id) => String(id) === String(user._id));
      setIsLiked(hasLiked);
    }
  }, [meme.likes, user]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to like memes!");
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    if (!isLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }

    try {
      const { data } = await likeMeme(meme._id, user.token);
      setLikeCount(data.likes?.length || 0);
    } catch (err) {
      setIsLiked(isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      console.error("Error liking meme:", err);
      alert("Failed to like meme. Please try again.");
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const shareData = {
        title: "Check out this meme!",
        text: meme.title || "Funny meme",
        url: `${window.location.origin}/meme/${meme._id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleCardClick = () => {
    navigate(`/meme/${meme._id}`);
  };

  const handleCommentClick = (e) => {
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
    <article className="bg-white border border-gray-200 mb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
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
            <span className="text-sm font-semibold text-black">
              {meme.author?.username || "Anonymous"}
            </span>
          </div>
        </div>
        <button className="p-1">
          <FaEllipsisH className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Media */}
      <div
        className="relative bg-black aspect-square"
        onClick={handleCardClick}
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
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={meme.mediaUrl}
            alt={meme.title || "Meme"}
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AiFillHeart className="w-16 h-16 text-white animate-ping" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="hover:opacity-50 transition-opacity"
            >
              {isLiked ? (
                <AiFillHeart className="w-6 h-6 text-red-500" />
              ) : (
                <AiOutlineHeart className="w-6 h-6 text-black" />
              )}
            </button>
            <button
              onClick={handleCommentClick}
              className="hover:opacity-50 transition-opacity"
            >
              <FaRegComment className="w-6 h-6 text-black" />
            </button>
            <button
              onClick={handleShare}
              className="hover:opacity-50 transition-opacity"
            >
              <FaShare className="w-6 h-6 text-black" />
            </button>
          </div>
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

        {/* Comments */}
        {meme.comments?.length > 0 && (
          <button
            onClick={handleCommentClick}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 block"
          >
            View all {meme.comments.length} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {meme.createdAt ? formatTimeAgo(meme.createdAt) : "now"}
        </div>
      </div>
    </article>
  );
}
