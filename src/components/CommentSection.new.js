import { useState, useEffect, useCallback } from "react";
import { getComments, postComment, deleteComment } from "../api";
import { Link } from "react-router-dom";

export default function CommentSection({ memeId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getComments(memeId);
      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [memeId]);

  useEffect(() => {
    if (memeId) {
      fetchComments();
    }
  }, [memeId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await postComment(memeId, newComment.trim(), user.token);
      setComments([data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId, user.token);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
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

  if (loading) {
    return (
      <div className="bg-white p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 text-sm">No comments yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={
                      comment.author?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${
                        comment.author?.username || "A"
                      }&background=f3f4f6&color=6b7280&size=32`
                    }
                    alt={comment.author?.username || "Anonymous"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold text-black mr-2">
                      {comment.author?.username || "Anonymous"}
                    </span>
                    <span className="text-black">{comment.text}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    <button className="text-xs text-gray-500 font-semibold hover:text-gray-700">
                      Reply
                    </button>
                    {(user?._id === comment.author?._id ||
                      user?.role === "admin") && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input */}
      {user ? (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
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
            <div className="flex-1 flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border-none outline-none text-sm bg-transparent placeholder-gray-500"
                maxLength="500"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className={`text-sm font-semibold ${
                  submitting || !newComment.trim()
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-700"
                }`}
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>{" "}
            to like or comment.
          </p>
        </div>
      )}
    </div>
  );
}
