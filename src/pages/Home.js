import { useEffect, useState } from "react";
import { fetchMemes } from "../api";
import MemeCard from "../components/MemeCard";

function Home({ user }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const handleVideoPlay = (memeId) => {
    setPlayingVideoId(memeId);
  };

  useEffect(() => {
    const fetchAllMemes = async () => {
      try {
        setLoading(true);
        const { data } = await fetchMemes();
        setMemes(data || []);
      } catch (err) {
        console.error("Error fetching memes:", err);
        setError("Failed to load memes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMemes();
  }, []);

  if (loading) {
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

              {/* Media skeleton with shimmer effect */}
              <div className="aspect-square animate-shimmer relative">
                {/* Instagram-style center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-white rounded-xl opacity-30"></div>
                </div>
              </div>

              {/* Action buttons with shimmer */}
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                  </div>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full animate-shimmer"></div>
                </div>

                {/* Likes count and caption */}
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

  if (error) {
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
      <div className="max-w-lg mx-auto px-0 sm:px-4">
        {memes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 text-lg">No memes found</p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="pt-4 sm:pt-8">
            {memes.map((meme) => (
              <MemeCard
                key={meme._id}
                meme={meme}
                user={user}
                onVideoPlay={handleVideoPlay}
                playingVideoId={playingVideoId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
