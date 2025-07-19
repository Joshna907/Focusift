'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import techniques from '../app/techniques';

export default function FocusTimerPage() {
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(25); // default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suggestedTechniques, setSuggestedTechniques] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wasInterrupted, setWasInterrupted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStop = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const endTime = new Date();
    const totalTime = Math.floor(((endTime.getTime() - (startTime?.getTime() ?? 0)) / 1000) / 60);
    const focusScore = Math.max(0, duration - tabSwitchCount * 5);

    const newSuggestions = techniques
      .filter((tech) => {
        if (focusScore >= 20) return tech.level === 'advanced';
        if (focusScore >= 10) return tech.level === 'intermediate';
        return tech.level === 'beginner';
      })
      .map((tech) => tech.name);

    setSuggestedTechniques(newSuggestions);

    toast.success(`Session completed. Focus Score: ${focusScore}`);

    localStorage.setItem('lastFocusScore', String(focusScore));
    localStorage.setItem('lastSuggestions', JSON.stringify(newSuggestions));
  }, [isRunning, startTime, tabSwitchCount, duration]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setTabSwitchCount((prev) => prev + 1);
        setWasInterrupted(true);
        toast.error('Paused: tab switch detected.');
        handleStop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, handleStop]);

  useEffect(() => {
    if (tabSwitchCount >= 3) {
      toast.error('Too many distractions. Session ended.');
      handleStop();
    }
  }, [tabSwitchCount, handleStop]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    if (isRunning) return;
    setSeconds(duration * 60);
    setIsRunning(true);
    setStartTime(new Date());
    setTabSwitchCount(0);
    setWasInterrupted(false);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / (duration * 60);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Toaster />
      <h1 className="text-4xl font-bold mb-6">Focus Timer</h1>

      <div className="mb-4">
        <input
          type="number"
          value={duration}
          disabled={isRunning}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-20 p-2 border rounded text-center"
        />
        <span className="ml-2">minutes</span>
      </div>

      <svg width="160" height="160" className="mb-4">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1 }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="20"
          fill="#111827"
        >
          {formatTime(seconds)}
        </text>
      </svg>

      <div className="space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
          aria-label="Start Timer"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          aria-label="Stop Timer"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Stop
        </button>
      </div>

      {suggestedTechniques.length > 0 && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Suggested Techniques</h2>
          <ul className="list-disc list-inside text-left">
            {suggestedTechniques.map((technique, index) => (
              <li key={index}>{technique}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
