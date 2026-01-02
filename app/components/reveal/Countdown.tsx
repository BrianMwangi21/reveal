'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  revealTime: Date;
  onReveal?: () => void;
  className?: string;
}

export default function Countdown({ revealTime, onReveal, className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const reveal = new Date(revealTime).getTime();
      const difference = reveal - now;

      if (difference <= 0) {
        if (!isRevealed) {
          setIsRevealed(true);
          onReveal?.();
        }
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [revealTime, isRevealed, onReveal]);

  if (!mounted) {
    return null;
  }

  if (isRevealed) {
    return null;
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg min-w-[70px] sm:min-w-[90px]">
        <span className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple to-pink bg-clip-text text-transparent">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex justify-center items-center gap-3 sm:gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400">:</div>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400">:</div>
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <div className="text-2xl sm:text-4xl font-bold text-gray-400">:</div>
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
}
