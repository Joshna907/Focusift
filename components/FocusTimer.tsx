'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import techniques from '../data/techniques.json';

type Technique = {
  name: string;
  description: string;
  category: string;
};

export default function FocusTimerPage() {
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [interrupted, setInterrupted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suggestedTechnique, setSuggestedTechnique] = useState<Technique | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    if (!isRunning) {
      const duration = customMinutes * 60;
      setTimeLeft(duration);
      setSessionStartTime(Date.now());
      setInterrupted(false);
      setTabSwitchCount(0);
      setSuggestedTechnique(null);
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (sessionStartTime) {
      const now = Date.now();
      const focusedMinutes = Math.floor((now - sessionStartTime) / 60000);

      let category = 'general';
      if (interrupted || tabSwitchCount >= 3) category = 'distraction';
      else if (focusedMinutes < 10) category = 'short';
      else if (focusedMinutes >= 30) category = 'long';

      const feedback: Record<string, { likes: number; dislikes: number }> = JSON.parse(
        localStorage.getItem('techFeedback') || '{}'
      );

      const filtered = (techniques as Technique[]).filter((t) => t.category === category);
      const sorted = filtered.sort((a, b) => {
        const aScore = (feedback[a.name]?.likes || 0) - (feedback[a.name]?.dislikes || 0);
        const bScore = (feedback[b.name]?.likes || 0) - (feedback[b.name]?.dislikes || 0);
        return bScore - aScore;
      });

      const top = sorted[0];
      setSuggestedTechnique(top);

      if (top) {
        toast.success(`${top.name}: ${top.description}`);
      } else {
        toast('No suggestion found. Try again.');
      }

      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            startTime: sessionStartTime,
            endTime: now,
            wasInterrupted: interrupted,
            tabSwitchCount,
          }),
        });
      } catch (err) {
        console.error('Logging failed:', err);
      }
    }
  };

  const handleFeedback = (liked: boolean) => {
    if (!suggestedTechnique) return;
    const feedback: Record<string, { likes: number; dislikes: number }> = JSON.parse(
      localStorage.getItem('techFeedback') || '{}'
    );
    const current = feedback[suggestedTechnique.name] || { likes: 0, dislikes: 0 };
    const updated = {
      ...feedback,
      [suggestedTechnique.name]: {
        likes: liked ? current.likes + 1 : current.likes,
        dislikes: !liked ? current.dislikes + 1 : current.dislikes,
      },
    };
    localStorage.setItem('techFeedback', JSON.stringify(updated));
    toast.success(`Thanks for your feedback!`);
    setSuggestedTechnique(null);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setTabSwitchCount((prev) => prev + 1);
        handleStop();
        setInterrupted(true);
        alert('Paused: tab switch detected.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  useEffect(() => {
    if (tabSwitchCount >= 3 && isRunning) {
      handleStop();
      alert('Too many distractions. Session ended.');
    }
  }, [tabSwitchCount, isRunning]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const percent = (timeLeft / (customMinutes * 60)) * 100;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
          },
          duration: 5000,
        }}
      />

      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center">
        <div className="text-center mt-20 px-4">
          <h1 className="text-5xl font-bold mb-2">Noise off. Focus on.</h1>
          <p className="text-white/70">A timer to sharpen your rhythm and attention.</p>

          {/* ✅ Updated Custom Minutes Input */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <label className="text-white/70 text-sm">Session Duration:</label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={120}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-28 text-center px-4 py-2 rounded-md bg-white text-black font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">min</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-300 disabled:opacity-50"
            >
              Start
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-4xl h-64 flex items-end justify-center mt-30">
          <svg viewBox="0 0 100 50" className="absolute w-full h-full">
            <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#1e293b" strokeWidth="10" />
            <motion.path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke="#00BFFF"
              strokeWidth="10"
              strokeLinecap="round"
              style={{
                pathLength: percent / 100,
                filter: 'drop-shadow(0 0 12px #00BFFF)',
              }}
              animate={{ pathLength: percent / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          <div className="absolute bottom-6 text-center">
            <h2 className="text-5xl font-bold font-mono">
              {minutes}:{seconds}
            </h2>
            <p className="text-sm mt-2 text-gray-400">Flow Time</p>
          </div>
        </div>

        {suggestedTechnique && (
          <div className="mt-8 bg-gray-800 p-4 rounded shadow max-w-md text-center">
            <p className="text-lg font-semibold">{suggestedTechnique.name}</p>
            <p className="text-sm text-white/70 mt-1">{suggestedTechnique.description}</p>
            <div className="mt-3 flex justify-center gap-4">
              <button
                onClick={() => handleFeedback(true)}
                className="bg-green-600 px-4 py-1 rounded"
                title="Like"
              >
                Like
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="bg-red-600 px-4 py-1 rounded"
                title="Dislike"
              >
                Dislike
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
