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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">
            Admin access only
          </h2>
          <p className="text-gray-600">You must be an admin to upload memes.</p>
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
      <div className="max-w-lg mx-auto pt-8 px-4">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black text-center">
              Create new post
            </h2>
          </div>

          <form onSubmit={handleUpload} className="p-4">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Write a caption..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-none outline-none text-sm placeholder-gray-500 resize-none"
                maxLength="200"
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {media ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FaImage className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-black">{media.name}</p>
                  <p className="text-xs text-gray-500">
                    {(media.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setMedia(null)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-black">
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
                    className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 cursor-pointer"
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
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!media || loading}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sharing..." : "Share"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
