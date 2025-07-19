'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  FaBrain, FaClock, FaBell, FaArrowUp, FaLinkedin,
  FaBug, FaCodeBranch, FaGithub
} from 'react-icons/fa';
import {
  motion,
  useMotionValue,
  useSpring
} from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const testimonials = [ /* unchanged */ ];
const features = [ /* unchanged */ ];

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return visible && (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition duration-300 z-50"
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>
  );
};

export default function Home() {
  const { data: session } = useSession();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 2000, damping: 80 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 2000, damping: 80 });
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    document.body.style.scrollSnapType = 'y mandatory';
    document.body.style.overflowY = 'scroll';
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A23] text-white overflow-x-hidden">
      <nav className="flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold">Focusift</div>
        <div className="space-x-4">
          {session ? (
            <>
              <Image src={session.user?.image || '/default-avatar.png'} alt="Profile" width={32} height={32} className="rounded-full" />
              <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => signIn('google', { callbackUrl: '/focus' })} className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-col md:flex-row items-center justify-between py-20">
        <div className="max-w-2xl z-10 mb-10 md:mb-0">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Boost your Focus <br />
            understand <span className="text-blue-500">your work habits</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Focus timer built for developers. It helps you stay in the zone while tracking and analyzing how you work daily and weekly.
          </p>
          <button
            onClick={() => session ? window.location.href = '/focus' : signIn('google', { callbackUrl: '/focus' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition"
          >
            Get started →
          </button>
        </div>
        <div className="w-full md:w-1/2 max-w-md mt-10 md:mt-0">
          <DotLottieReact src="/animations/coding.lottie" autoplay loop style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      <div className="w-full overflow-x-hidden mb-10">
        <div className="flex gap-6 animate-scroll px-4 w-max whitespace-nowrap">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[250px] max-w-[200px] bg-[#a7e4e4]/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-md text-white whitespace-normal">
              <Image src={t.image} alt={t.name} width={40} height={40} className="rounded-full mb-3 object-cover" />
              <p className="text-sm leading-relaxed mb-3">"{t.message}"</p>
              <h4 className="text-sm font-semibold text-blue-300">— {t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <section className="relative w-full bg-[#0409ff] py-20 px-6 sm:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Focusift?</h2>
          <p className="text-lg text-blue-300 max-w-xl mx-auto">
            Everything you need to stay focused and productive, built with simplicity and precision in mind.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {features.map((feat, i) => (
            <div key={i} className="flex-1 bg-[#12122c] hover:bg-blue-600 transition-colors duration-300 rounded-2xl shadow-md p-6">
              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-200">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Animated section */}
      <section ref={ref} className="py-24 px-6 md:px-20 bg-[#0A0A23] flex flex-col md:flex-row items-center justify-between gap-12">
        <div
          className="w-full md:w-1/2 flex justify-center relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            rotateX.set(-(e.clientY - rect.top - rect.height / 2) / 10);
            rotateY.set((e.clientX - rect.left - rect.width / 2) / 10);
          }}
          onMouseLeave={() => {
            rotateX.set(0);
            rotateY.set(0);
          }}
        >
          <motion.img
            src="/images/brain.png"
            alt="3D Brain"
            className="max-w-[80%] md:max-w-[70%] drop-shadow-[0_0_40px_rgba(0,212,255,0.5)]"
            style={{ rotateX: smoothRotateX, rotateY: smoothRotateY }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          />
        </div>

        <motion.div
          className="w-full md:w-1/2"
          initial={{ x: 100, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 1.2 }}
        >
          <h2 className="text-4xl font-bold leading-snug mb-4">
            Master Your <span className="text-blue-400">Work Rhythm</span>,<br />
            Unlock <span className="text-purple-400">Peak Productivity</span>
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Focusift tracks your focus patterns, detects your most productive hours, and gives smart reminders—so you can work with intention, not just habit.
          </p>
        </motion.div>
      </section>

      {/* Bug report section */}
      <section className="bg-[#292525] text-white py-24 text-center w-full">
        <h2 className="text-4xl font-extrabold mb-10">Report a Bug!</h2>
        <div className="max-w-4xl mx-auto px-4 text-left text-gray-400">
          <p className="mb-6 flex items-start gap-3">
            <FaBug className="text-xl mt-1" />
            <span>
              <strong>Raise an issue on the repository</strong><br />
              If you encounter any bugs or issues while using Focusift, please <a href="https://github.com/Joshna907/codexy/issues" className="underline">raise an issue</a>.
            </span>
          </p>
          <p className="flex items-start gap-3">
            <FaCodeBranch className="text-xl mt-1" />
            <span>
              <strong>Contribute to the repository</strong><br />
              Help us improve Focusift by submitting a <a href="https://github.com/Joshna907/codexy" className="underline">pull request</a>.
            </span>
          </p>
        </div>
      </section>

      <footer className="bg-[#0A0A23] text-white text-center py-10">
        <h3 className="text-2xl font-bold tracking-wide mb-4">Focusift</h3>
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://www.linkedin.com/in/jothsana-waikar-a37a8423a" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
            <FaLinkedin />
          </a>
          <a href="https://github.com/Joshna907" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition">
            <FaGithub />
          </a>
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Focusift. All rights reserved.</p>
      </footer>

      <ScrollToTopButton />
    </main>
  );
}
