import { useEffect, useState } from "react";
import {
  FiTrendingUp,
  FiRefreshCw,
  FiHeart,
  FiEye,
  FiShare2,
  FiArrowLeft,
} from "react-icons/fi";
import { Link } from "react-router-dom";

function Trending() {
  const [trendingMemes, setTrendingMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending memes
  const fetchTrendingMemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000/api"
        }/memes/trending?limit=12`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTrendingMemes(data || []);
    } catch (err) {
      console.error("Error fetching trending memes:", err);
      setTrendingMemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingMemes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading trending memes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center">
                  <FiTrendingUp className="text-gray-700 text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Trending
                  </h1>
                  <p className="text-gray-600 text-sm">
                    What's getting attention right now
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchTrendingMemes}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trending Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {trendingMemes.length > 0 ? (
          <div className="space-y-8">
            {/* Featured Trending Meme */}
            {trendingMemes[0] && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="relative group cursor-pointer">
                      <div className={
                        trendingMemes[0].aspectRatio === "reel"
                          ? "reel-container w-64 lg:w-80 rounded-xl overflow-hidden border border-gray-200"
                          : "w-64 h-64 lg:w-80 lg:h-80 rounded-xl overflow-hidden border border-gray-200"
                      }>
                        {trendingMemes[0].mediaType === "video" ? (
                          <video
                            src={trendingMemes[0].mediaUrl}
                            className="w-full h-full"
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={trendingMemes[0].mediaUrl}
                            alt={trendingMemes[0].title}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-semibold text-gray-800 border border-gray-300">
                        #1 Trending
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">
                        {trendingMemes[0].title || "Featured Meme"}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-5 text-sm">
                        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white">
                          <FiHeart className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700">
                            {trendingMemes[0].likes?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white">
                          <FiEye className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700">
                            {trendingMemes[0].views || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white">
                          <FiShare2 className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700">
                            {trendingMemes[0].shares || 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        This meme is currently trending across the platform.
                        Join the conversation and see why everyone's talking
                        about it!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Trending Memes Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                More Trending
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {trendingMemes.slice(1).map((meme, index) => (
                  <div key={meme._id} className="group cursor-pointer">
                    <div className="relative">
                      <div className={
                        meme.aspectRatio === "reel"
                          ? "reel-container rounded-lg overflow-hidden border border-gray-200"
                          : "w-full aspect-square rounded-lg overflow-hidden border border-gray-200"
                      }>
                        {meme.mediaType === "video" ? (
                          <video
                            src={meme.mediaUrl}
                            className="w-full h-full"
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={meme.mediaUrl}
                            alt={meme.title}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-semibold text-gray-800 border border-gray-300">
                        #{index + 2}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 rounded-lg"></div>
                    </div>
                    <div className="mt-3 text-center">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {meme.title || "Untitled"}
                      </h4>
                      <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiHeart className="w-3 h-3 text-gray-600" />
                          <span>{meme.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FiEye className="w-3 h-3 text-gray-600" />
                          <span>{meme.views || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrendingUp className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trending memes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create something amazing!
            </p>
            <button
              onClick={fetchTrendingMemes}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trending;
