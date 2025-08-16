import { useEffect, useState } from "react";
import { FiTrendingUp, FiRefreshCw, FiHeart, FiEye, FiShare2, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

function Trending() {
  const [trendingMemes, setTrendingMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending memes
  const fetchTrendingMemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/memes/trending?limit=12`);
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
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Trending</h1>
                  <p className="text-gray-600">Discover what's hot right now</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchTrendingMemes}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {trendingMemes[0].mediaType === "video" ? (
                          <video
                            src={trendingMemes[0].mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={trendingMemes[0].mediaUrl}
                            alt={trendingMemes[0].title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        #1 Trending
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        {trendingMemes[0].title || "Featured Meme"}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                          <FiHeart className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                          <FiEye className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                          <FiShare2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].shares || 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        This meme is currently trending across the platform. Join the conversation and see why everyone's talking about it!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Trending Memes Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">More Trending</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {trendingMemes.slice(1).map((meme, index) => (
                  <div key={meme._id} className="group cursor-pointer">
                    <div className="relative">
                      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                        {meme.mediaType === "video" ? (
                          <video
                            src={meme.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={meme.mediaUrl}
                            alt={meme.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        #{index + 2}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                    </div>
                    <div className="mt-3 text-center">
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {meme.title || "Untitled"}
                      </h4>
                      <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiHeart className="w-3 h-3 text-red-500" />
                          <span>{meme.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FiEye className="w-3 h-3 text-blue-500" />
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending memes yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create something amazing!</p>
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
