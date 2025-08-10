import { useState } from "react";
import { uploadMeme } from "../api";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaImage } from "react-icons/fa";

export default function Upload({ user }) {
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user || user.role !== "admin")
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black">
            Admin access only
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            You must be an admin to upload memes.
          </p>
        </div>
      </div>
    );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!media) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("media", media);

    try {
      const { data } = await uploadMeme(formData, user.token);
      alert("Meme uploaded successfully!");
      navigate(`/meme/${data._id}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
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
    const files = e.dataTransfer.files;
    if (files.length) {
      setMedia(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto pt-6 sm:pt-8 px-3 sm:px-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-black text-center">
              Create new post
            </h2>
          </div>

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
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <p className="text-sm sm:text-base font-medium text-black">
                    {media.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(media.size / 1024 / 1024).toFixed(2)} MB
                  </p>
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
    </div>
  );
}
