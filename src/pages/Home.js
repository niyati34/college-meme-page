import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMemes } from "../api";
import MemeCard from "../components/MemeCard";
import { FiFilter, FiSearch, FiGrid, FiX, FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";

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

  // Search submit handler
  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCurrentPage(1);
    setMemes([]);
    fetchAllMemes(1, true);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setMemes([]);
    fetchAllMemes(1, true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSortBy("newest");
    setSearchQuery("");
    setCurrentPage(1);
    setMemes([]);
    fetchAllMemes(1, true);
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

  // Initial load
  useEffect(() => {
    fetchAllMemes(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } else if (filterType === "sort" || filterType === "sortBy") {
      setSortBy(value);
    }
    setCurrentPage(1);
    setMemes([]);
    // Refresh results with new filters
    fetchAllMemes(1, true);
  };

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

  {/* Centralized Search + Inline Controls */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filters button (left) */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${
                  showFilters ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiFilter className="w-3 h-3" />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            {/* Center search (fills available space) */}
            <div className="flex-1 w-full">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search memes, tags or categories — press Enter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Trending (right) */}
            <div className="flex-shrink-0">
              <Link
                to="/trending"
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm"
              >
                <FiTrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </Link>
            </div>
          </div>

          {/* Compact Filter Options */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl animate-slideDown">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleFilterChange("category", category.id)}
                        className={`p-2 rounded-lg border transition-all duration-200 flex flex-col items-center space-y-0.5 ${
                          selectedCategory === category.id
                            ? "bg-blue-500 text-white border-blue-500 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-xs font-medium leading-tight">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="space-y-1.5">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange("sort", option.value)}
                        className={`w-full p-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 text-sm ${
                          sortBy === option.value
                            ? "bg-blue-500 text-white border-blue-500 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <span>{option.icon}</span>
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
                      playingVideoId={playingVideoId}
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
                    playingVideoId={playingVideoId}
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