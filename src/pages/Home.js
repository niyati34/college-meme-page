import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMemes } from "../api";
import MemeCard from "../components/MemeCard";
import { FiTrendingUp, FiFilter, FiSearch, FiGrid } from "react-icons/fi";

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
  
  const observer = useRef();
  const lastMemeRef = useRef();

  const categories = [
    { id: "", label: "All Categories" },
    { id: "funny", label: "Funny" },
    { id: "gaming", label: "Gaming" },
    { id: "anime", label: "Anime" },
    { id: "movies", label: "Movies" },
    { id: "politics", label: "Politics" },
    { id: "sports", label: "Sports" },
    { id: "tech", label: "Tech" },
    { id: "other", label: "Other" }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "trending", label: "Trending" },
    { value: "popular", label: "Most Popular" },
    { value: "mostViewed", label: "Most Viewed" },
    { value: "oldest", label: "Oldest" }
  ];

  const handleVideoPlay = (memeId) => {
    setPlayingVideoId(memeId);
  };

  // Fetch trending memes
  const fetchTrendingMemes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/memes/trending?limit=5`);
      const data = await response.json();
      setTrendingMemes(data);
    } catch (err) {
      console.error("Error fetching trending memes:", err);
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

  useEffect(() => {
    fetchAllMemes(1, true);
    fetchTrendingMemes();
  }, [fetchAllMemes]);

  if (loading && memes.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto pt-4 sm:pt-8 px-0 sm:px-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-none sm:rounded-lg mb-6 overflow-hidden"
            >
              <div className="flex items-center p-3 space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-shimmer"></div>
                <div className="flex-1">
                  <div className="h-4 w-1/3 rounded-lg animate-shimmer"></div>
                  <div className="h-3 w-1/5 mt-1 rounded-lg animate-shimmer"></div>
                </div>
                <div className="w-6 h-6 rounded-full animate-shimmer"></div>
              </div>

              <div className="aspect-square animate-shimmer relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-white rounded-xl opacity-30"></div>
                </div>
              </div>

              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                  </div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                </div>

                <div className="h-4 w-16 rounded-lg animate-shimmer"></div>
                <div className="h-4 w-3/4 rounded-lg animate-shimmer"></div>
                <div className="h-3 w-1/4 rounded-lg animate-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && memes.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Trending Section */}
      {trendingMemes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center space-x-2 mb-3">
              <FiTrendingUp className="text-purple-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800">Trending Now</h2>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {trendingMemes.map((meme, index) => (
                <div key={meme._id} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-purple-200">
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
                  <p className="text-xs text-gray-600 mt-1 text-center truncate w-24">
                    {meme.title || "Untitled"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <FiFilter />
              <span>Filters</span>
            </button>
            
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 space-y-3 animate-slideDown">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange("category", category.id)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Memes Grid */}
      <div className="max-w-lg mx-auto px-0 sm:px-4">
        {memes.length === 0 && !loading ? (
          <div className="text-center py-12">
            <FiGrid className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500 text-lg">No memes found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          memes.map((meme, index) => {
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
          })
        )}

        {/* Loading indicator for infinite scroll */}
        {loading && memes.length > 0 && (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* End of content */}
        {!hasMore && memes.length > 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>You've reached the end! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
