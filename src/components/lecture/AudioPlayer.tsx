import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatTimestamp } from '../../audio/audioProcessor';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AudioPlayerProps {
  durationSeconds: number;
  audioBlob?: Blob;
  audioUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  durationSeconds,
  audioBlob,
  audioUrl,
}) => {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackRate,
    setPlaybackRate,
    seekTarget,
  } = useAppStore();

  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If there's an actual audio URL or blob URL, use HTMLAudioElement
  const actualAudioSrc = audioUrl || (audioBlob ? URL.createObjectURL(audioBlob) : null);

  // Handle external seek requests (e.g. from timestamp citation click)
  useEffect(() => {
    if (seekTarget !== null) {
      if (audioRef.current) {
        audioRef.current.currentTime = seekTarget;
      }
      setCurrentTime(seekTarget);
    }
  }, [seekTarget, setCurrentTime]);

  // Handle keyboard shortcut (Space for play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime]);

  // Fallback synthetic timer for demo/sample lectures if no audio file is attached
  useEffect(() => {
    if (!actualAudioSrc && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(Math.min(durationSeconds, currentTime + 0.5 * playbackRate));
        if (currentTime >= durationSeconds) {
          setIsPlaying(false);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [actualAudioSrc, isPlaying, currentTime, durationSeconds, playbackRate, setCurrentTime, setIsPlaying]);

  const togglePlayPause = () => {
    if (actualAudioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (deltaSec: number) => {
    const target = Math.max(0, Math.min(durationSeconds, currentTime + deltaSec));
    if (actualAudioSrc && audioRef.current) {
      audioRef.current.currentTime = target;
    }
    setCurrentTime(target);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (actualAudioSrc && audioRef.current) {
      audioRef.current.currentTime = target;
    }
    setCurrentTime(target);
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-4 shadow-sm space-y-3">
      {actualAudioSrc && (
        <audio
          ref={audioRef}
          src={actualAudioSrc}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Seekbar and Time Display */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={durationSeconds || 1}
          step={0.5}
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-[#E5E0D8] dark:bg-[#2A2825] rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
          aria-label="Audio timeline"
        />

        <div className="flex justify-between text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
          <span>{formatTimestamp(currentTime)}</span>
          <span>{formatTimestamp(durationSeconds)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Play/Pause & Skip */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => skip(-10)}
            className="p-1.5 rounded-lg text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Rewind 10 seconds (Left Arrow)"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-[#C8102E] hover:bg-[#A50D25] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-1.5 rounded-lg text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Forward 10 seconds (Right Arrow)"
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F] mr-1">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPlaybackRate(s);
                if (audioRef.current) {
                  audioRef.current.playbackRate = s;
                }
              }}
              className={`px-1.5 py-0.5 text-[10px] font-mono-code rounded transition-colors ${
                playbackRate === s
                  ? 'bg-[#C8102E] text-white font-semibold'
                  : 'bg-black/5 dark:bg-white/5 text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Mute/Volume toggle */}
        <button
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            if (audioRef.current) {
              audioRef.current.muted = next;
            }
          }}
          className="p-1.5 rounded-lg text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
