'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { RevealType } from '@/lib/models/Room';

interface RevealDisplayProps {
  revealType: RevealType;
  revealContent: {
    type: 'text' | 'image' | 'video';
    value: string;
    caption?: string;
  };
  className?: string;
}

export default function RevealDisplay({ revealType, revealContent, className = '' }: RevealDisplayProps) {
  useEffect(() => {
    const triggerConfetti = () => {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const colors = revealType === 'gender' 
        ? ['#FF69B4', '#4169E1', '#FFD700', '#FF1493'] 
        : ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FF6347'];

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
        });
      }, 250);
    };

    triggerConfetti();
  }, [revealType]);

  const getRevealIcon = () => {
    switch (revealType) {
      case 'gender':
        return revealContent.value.toLowerCase().includes('boy') ? '👦' : '👧';
      case 'baby':
        return '👶';
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💕';
      case 'custom':
        return '🎉';
      default:
        return '🎉';
    }
  };

  const getGradientClass = () => {
    switch (revealType) {
      case 'gender':
        return revealContent.value.toLowerCase().includes('boy')
          ? 'from-blue-400 to-blue-600'
          : 'from-pink-400 to-pink-600';
      case 'baby':
        return 'from-purple-400 to-pink-400';
      case 'birthday':
        return 'from-yellow-400 to-orange-400';
      case 'anniversary':
        return 'from-red-400 to-pink-500';
      case 'custom':
        return 'from-purple-400 via-pink-400 to-blue-400';
      default:
        return 'from-purple-400 via-pink-400 to-blue-400';
    }
  };

  return (
    <div className={className}>
      <div className={`bg-gradient-to-r ${getGradientClass()} rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10 animate-pulse" />
        <div className="relative z-10">
          <div className="text-6xl sm:text-8xl mb-6 animate-bounce">
            {getRevealIcon()}
          </div>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 opacity-90">
              {revealType === 'gender' && "It's a..."}
              {revealType === 'baby' && "The Baby Is..."}
              {revealType === 'birthday' && "Happy Birthday! You're..."}
              {revealType === 'anniversary' && "Happy Anniversary!"}
              {revealType === 'custom' && "The Reveal Is..."}
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
              {revealContent.value}
            </h1>
          </div>
          {revealContent.caption && (
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              {revealContent.caption}
            </p>
          )}
          <div className="mt-6 sm:mt-8 text-4xl sm:text-6xl animate-pulse">
            🎉 🎊 🎉
          </div>
        </div>
      </div>
    </div>
  );
}
