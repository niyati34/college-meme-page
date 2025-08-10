import { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaVolumeMute, FaPlay, FaPause } from "react-icons/fa";

export default function VideoPlayer({
  src,
  memeId,
  onPlay,
  shouldPlay = false,
  className = "",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Videos start muted for better UX
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay && isLoaded) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Auto-play failed:", err);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [shouldPlay, isLoaded]);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) {
      onPlay(memeId); // Notify parent to pause other videos
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      if (onPlay) {
        onPlay(memeId);
      }
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        onLoadedData={handleLoadedData}
        onPlay={handlePlay}
        onPause={handlePause}
        onClick={handleVideoClick}
      />

      {/* Video Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <button
          onClick={handleVideoClick}
          className="bg-black/50 text-white p-4 rounded-full pointer-events-auto hover:bg-black/70 transition-colors"
        >
          {isPlaying ? (
            <FaPause className="w-6 h-6" />
          ) : (
            <FaPlay className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sound Control */}
      <button
        onClick={handleMuteToggle}
        className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
      >
        {isMuted ? (
          <FaVolumeMute className="w-4 h-4" />
        ) : (
          <FaVolumeUp className="w-4 h-4" />
        )}
      </button>

      {/* Video Indicator */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
        VIDEO
      </div>
    </div>
  );
}
