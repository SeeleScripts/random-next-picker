"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface RaffleBoxProps {
  names: string[];
  isAnimating: boolean;
  winner: string | null;
  animationDuration: number;
  onAnimationEnd: (winner: string) => void;
}

export default function RaffleBox({
  names,
  isAnimating,
  winner,
  animationDuration,
  onAnimationEnd,
}: RaffleBoxProps) {
  const [displayedName, setDisplayedName] = useState<string>("");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a tick sound - frequency and duration vary with animation speed
  const playTickSound = useCallback(
    (frequency: number = 800, duration: number = 0.05) => {
      try {
        const audioContext = getAudioContext();
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (e) {
        // Audio not supported, fail silently
      }
    },
    [getAudioContext]
  );

  // Play winner fanfare
  const playWinnerSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      // Play a sequence of ascending notes
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      // Audio not supported, fail silently
    }
  }, [getAudioContext]);

  // Easing function for slow-fast-slow animation
  const getIntervalFromProgress = useCallback((progress: number): number => {
    const minInterval = 30;
    const maxInterval = 300;
    const speedFactor = Math.sin(progress * Math.PI);
    return maxInterval - speedFactor * (maxInterval - minInterval);
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastUpdateRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / (animationDuration * 1000), 1);
      const currentInterval = getIntervalFromProgress(progress);

      // Update display if enough time has passed
      if (timestamp - lastUpdateRef.current >= currentInterval) {
        currentIndexRef.current = (currentIndexRef.current + 1) % names.length;
        setDisplayedName(names[currentIndexRef.current]);
        lastUpdateRef.current = timestamp;
        setCurrentSpeed(Math.round(1000 / currentInterval));

        // Play tick sound - higher frequency at faster speeds
        const tickFrequency = 400 + (1 - currentInterval / 300) * 600;
        playTickSound(tickFrequency, 0.03 + currentInterval / 5000);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - pick winner
        const winnerIndex = Math.floor(Math.random() * names.length);
        const selectedWinner = names[winnerIndex];
        setDisplayedName(selectedWinner);
        playWinnerSound();
        onAnimationEnd(selectedWinner);
      }
    },
    [
      names,
      animationDuration,
      onAnimationEnd,
      getIntervalFromProgress,
      playTickSound,
      playWinnerSound,
    ]
  );

  useEffect(() => {
    if (isAnimating && names.length > 0) {
      // Reset refs
      startTimeRef.current = 0;
      currentIndexRef.current = 0;
      lastUpdateRef.current = 0;

      // Start animation
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isAnimating, names, animate]);

  // Display logic
  const getDisplayContent = () => {
    if (winner) {
      return (
        <div className="flex flex-col items-center gap-4">
          <span className="text-2xl text-pink-400 font-medium">
            🎉 ¡Ganador! 🎉
          </span>
          <span className="text-5xl md:text-6xl font-bold text-white animate-pulse">
            {winner}
          </span>
        </div>
      );
    }

    if (isAnimating && displayedName) {
      return (
        <span className="text-5xl md:text-6xl font-bold text-white transition-all duration-75">
          {displayedName}
        </span>
      );
    }

    if (names.length === 0) {
      return (
        <span className="text-2xl text-gray-400 italic">
          Agrega nombres para comenzar
        </span>
      );
    }

    return (
      <span className="text-3xl text-gray-300">
        {names.length} participantes listos
      </span>
    );
  };

  return (
    <div className="raffle-box w-[600px] h-[400px] rounded-3xl flex items-center justify-center overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        {getDisplayContent()}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-pink-400/50 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-pink-400/50 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-pink-400/50 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-400/50 rounded-br-lg" />
    </div>
  );
}
