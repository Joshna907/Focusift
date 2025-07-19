'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import techniques from '../app/data/techniques.json'; // ✅ Corrected path

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(0);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [suggestedTechnique, setSuggestedTechnique] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const custom = parseInt(customMinutes);
    if (!isNaN(custom)) {
      setSeconds(custom * 60);
      setIsRunning(true);
    } else {
      toast.error('Please enter valid minutes');
    }
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      stopTimer();
      const random = Math.floor(Math.random() * techniques.length);
      setSuggestedTechnique(techniques[random]);
      toast.success('Focus session completed!');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-sm mx-auto mt-10 text-center">
      <Toaster />
      <h1 className="text-xl font-bold mb-4">Focus Timer</h1>

      <div className="mb-4">
        <input
          type="number"
          placeholder="Enter minutes"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          className="border p-2 rounded w-full text-center"
        />
      </div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="text-4xl font-semibold mb-4"
      >
        {formatTime(seconds)}
      </motion.div>

      <div className="space-x-2">
        <button
          onClick={startTimer}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop
        </button>
      </div>

      {suggestedTechnique && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold text-lg">Suggested Technique:</h2>
          <p>{suggestedTechnique}</p>
        </div>
      )}
    </div>
  );
}
