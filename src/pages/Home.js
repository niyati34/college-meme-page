import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMemes } from "../api";
import MemeCard from "../components/MemeCard";
import { FiTrendingUp, FiFilter, FiSearch, FiGrid, FiX, FiRefreshCw, FiHeart, FiEye, FiShare2 } from "react-icons/fi";

function Home({ user }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  
  // Advanced features
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [trendingMemes, setTrendingMemes] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  
  const observer = useRef();
  const lastMemeRef = useRef();

  const categories = [
    { id: "", label: "All", icon: "🌟" },
    { id: "funny", label: "Funny", icon: "😂" },
    { id: "gaming", label: "Gaming", icon: "🎮" },
    { id: "anime", label: "Anime", icon: "✨" },
    { id: "movies", label: "Movies", icon: "🎬" },
    { id: "politics", label: "Politics", icon: "🗳️" },
    { id: "sports", label: "Sports", icon: "⚽" },
    { id: "tech", label: "Tech", icon: "💻" },
    { id: "other", label: "Other", icon: "🎯" }
  ];

  const sortOptions = [
    { value: "newest", label: "Latest", icon: "🆕" },
    { value: "trending", label: "Trending", icon: "🔥" },
    { value: "popular", label: "Popular", icon: "⭐" },
    { value: "mostViewed", label: "Most Viewed", icon: "👁️" },
    { value: "oldest", label: "Oldest", icon: "📜" }
  ];

  const handleVideoPlay = (memeId) => {
    setPlayingVideoId(memeId);
  };

  // Enhanced trending memes fetch with better error handling
  const fetchTrendingMemes = async () => {
    try {
      setTrendingLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/memes/trending?limit=6`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTrendingMemes(data || []);
    } catch (err) {
      console.error("Error fetching trending memes:", err);
      setTrendingMemes([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  // Fetch memes with filters
  const fetchAllMemes = useCallback(async (page = 1, reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });

      const { data } = await fetchMemes(params.toString());
      
      if (reset) {
        setMemes(data.memes || []);
        setCurrentPage(1);
      } else {
        setMemes(prev => [...prev, ...(data.memes || [])]);
      }
      
      setHasMore(data.pagination?.hasNext || false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching memes:", err);
      setError("Failed to load memes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [sortBy, selectedCategory, searchQuery]);

  // Infinite scroll observer
  const lastMemeElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchAllMemes(currentPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, currentPage, fetchAllMemes]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === "category") {
      setSelectedCategory(value);
    } else if (filterType === "sort") {
      setSortBy(value);
    }
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchAllMemes(1, true);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSortBy("newest");
    setSearchQuery("");
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchAllMemes(1, true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchAllMemes(1, true);
  };

  useEffect(() => {
    fetchAllMemes(1, true);
    fetchTrendingMemes();
  }, [fetchAllMemes]);

  if (loading && memes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto pt-8 px-4">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading your meme feed...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && memes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="text-red-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Trending Section - User-Friendly Design */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Trending Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-gray-600">Discover what's hot this week</p>
              </div>
            </div>
            <button
              onClick={fetchTrendingMemes}
              disabled={trendingLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50"
              title="Refresh trending memes"
            >
              <FiRefreshCw className={`w-4 h-4 ${trendingLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {/* Trending Content */}
          {trendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingMemes.length > 0 ? (
            <div className="space-y-6">
              {/* Featured Trending Meme (Larger) */}
              {trendingMemes[0] && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-100">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative group cursor-pointer">
                      <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300">
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
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        #1 Trending
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {trendingMemes[0].title || "Featured Meme"}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                          <FiHeart className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                          <FiEye className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                          <FiShare2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-gray-700">{trendingMemes[0].shares || 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm md:text-base">
                        This meme is blowing up! Join the conversation and see why everyone's talking about it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Trending Memes Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">More Trending</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {trendingMemes.slice(1).map((meme, index) => (
                    <div key={meme._id} className="group cursor-pointer">
                      <div className="relative">
                        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
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
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-2xl"></div>
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
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="text-gray-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending memes yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create something amazing!</p>
              <button
                onClick={fetchTrendingMemes}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search for memes, tags, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
              
              {(selectedCategory || searchQuery || sortBy !== "newest") && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            <div className="flex items-center space-x-2">
              {selectedCategory && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {categories.find(c => c.id === selectedCategory)?.label}
                </span>
              )}
              {sortBy !== "newest" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {sortOptions.find(s => s.value === sortBy)?.label}
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl animate-slideDown">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleFilterChange("category", category.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                          selectedCategory === category.id
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-xs font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange("sort", option.value)}
                        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                          sortBy === option.value
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Memes Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {memes.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiGrid className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No memes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {memes.map((meme, index) => {
              if (memes.length === index + 1) {
                return (
                  <div key={meme._id} ref={lastMemeElementRef}>
                    <MemeCard
                      meme={meme}
                      user={user}
                      onVideoPlay={handleVideoPlay}
                      isPlaying={playingVideoId === meme._id}
                    />
                  </div>
                );
              } else {
                return (
                  <MemeCard
                    key={meme._id}
                    meme={meme}
                    user={user}
                    onVideoPlay={handleVideoPlay}
                    isPlaying={playingVideoId === meme._id}
                  />
                );
              }
            })}
          </div>
        )}

        {/* Enhanced Loading indicator */}
        {loading && memes.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading more memes...</span>
            </div>
          </div>
        )}

        {/* Enhanced End of content */}
        {!hasMore && memes.length > 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎉</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You've reached the end!</h3>
            <p className="text-gray-600">Check back later for fresh memes</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;