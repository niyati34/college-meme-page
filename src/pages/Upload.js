import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage, FaCloudUploadAlt } from "react-icons/fa";
import { uploadMeme } from "../api";

export default function Upload({ user }) {
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("normal");
  const [media, setMedia] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!media || !title) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("aspectRatio", aspectRatio);
      formData.append("media", media);
      await uploadMeme(formData, user?.token);
      setTitle("");
      setAspectRatio("normal");
      setMedia(null);
      navigate("/");
    } catch (err) {
      // handle error (show toast, etc)
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMedia(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto p-4">
        <form onSubmit={handleUpload} className="p-3 sm:p-4">
          <div className="mb-6">
            <textarea
              placeholder="Write a caption..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-none outline-none text-sm sm:text-base placeholder-gray-500 resize-none"
              maxLength="2200"
              rows="3"
            />
            <div className="text-xs sm:text-sm text-gray-400 text-right mt-1">
              {title.length}/2200
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="normal">Normal (1:1 or 4:5)</option>
              <option value="reel">Reel (9:16, like Instagram Reels)</option>
            </select>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${
              isDragOver
                ? "border-blue-400 bg-blue-50 scale-102"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {media ? (
              <div className="space-y-4 slide-in">
                {media.type.startsWith("image/") ? (
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(media)}
                      alt="Preview"
                      className="max-h-48 sm:max-h-64 max-w-full rounded-lg shadow-md"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <FaImage className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMedia(null)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`transition-transform duration-300 ${
                      isDragOver ? "scale-110" : ""
                    }`}
                  >
                    <FaCloudUploadAlt className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-medium text-black">
                    Drag photos and videos here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to select files
                  </p>
                </div>
                <input
                  type="file"
                  onChange={(e) => setMedia(e.target.files[0])}
                  accept="image/*,video/*"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                >
                  Select from computer
                </label>
              </div>
            )}
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!media || loading}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5 text-white animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sharing...</span>
                </div>
              ) : (
                "Share"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
