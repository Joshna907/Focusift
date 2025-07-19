'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  FaBrain, FaClock, FaBell, FaArrowUp, FaLinkedin,
  FaBug, FaCodeBranch, FaGithub
} from "react-icons/fa";
import {
  motion,
  useMotionValue,
  useSpring
} from 'framer-motion';
import { useInView } from "react-intersection-observer";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&q=80",
    message: "Focusift helped me realize when I'm most productive. The suggestions boosted my focus!",
  },
  {
    name: "David Kim",
    image: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?fit=crop&w=150&q=80",
    message: "The personalized technique suggested by Focusift worked wonders for my workflow.",
  },
  {
    name: "Emily Rodriguez",
    image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?fit=crop&w=150&q=80",
    message: "From procrastination to productivity. Focusift understood my habits perfectly!",
  },
  {
    name: "Michael Chang",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?fit=crop&w=150&q=80",
    message: "Great insights and timing suggestions — felt like I had a personal productivity coach.",
  },
  {
    name: "Lina Müller",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?fit=crop&w=150&q=80",
    message: "Perfectly balanced suggestions. It’s not intrusive — just right.",
  },
];

const features = [
  {
    icon: <FaBrain />,
    title: "Context-Aware Reminders",
    description: "Receive smart nudges based on your work rhythm to help you stay on task without being overwhelmed.",
  },
  {
    icon: <FaClock />,
    title: "Perfect Timing",
    description: "Focusift learns your peak productivity hours and encourages deep focus exactly when it matters.",
  },
  {
    icon: <FaBell />,
    title: "Personalized Alerts",
    description: "No generic notifications—only tailored updates that align with your tasks and goals.",
  },
];

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
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
            <div className="flex items-center gap-4">
              <Image src={session.user?.image || '/default-avatar.png'} alt="Profile" className="w-8 h-8 rounded-full" />
              <span className="text-sm">{session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/focus' })}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            >
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
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (session) {
                  window.location.href = '/focus';
                } else {
                  signIn('google', { callbackUrl: '/focus' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition"
            >
              Get started →
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 max-w-md mt-10 md:mt-0">
          <DotLottieReact src="/animations/coding.lottie" autoplay loop style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      <div className="w-full overflow-x-hidden">
        <div className="flex gap-6 animate-scroll px-4 w-max whitespace-nowrap mb-5">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[250px] max-w-[200px] bg-[#a7e4e4]/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-md text-white whitespace-normal break-words">
              <Image src={t.image} alt={t.name} className="w-10 h-10 rounded-full mb-3 object-cover" />
              <p className="text-sm leading-relaxed mb-3">&quot;{t.message}&quot;</p>

              <h4 className="text-sm font-semibold text-blue-300">— {t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      <section className="relative w-full bg-[#0409ff] py-20 px-6 sm:px-12 mt-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Focusift?</h2>
          <p className="text-lg text-blue-300 max-w-xl mx-auto">
            Everything you need to stay focused and productive, built with simplicity and precision in mind.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex-1 bg-[#12122c] hover:bg-blue-600 transition-colors duration-300 text-white rounded-2xl shadow-md p-6 pb-6 w-full max-w-xs mx-auto md:max-w-sm">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-200 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={ref} className="py-24 px-6 md:px-20 bg-[#0A0A23] flex flex-col md:flex-row items-center justify-between gap-12">
        <div
          className="w-full md:w-1/2 flex justify-center relative before:absolute before:inset-0 before:bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_1px,_transparent_1px)] before:bg-[size:30px_30px] before:rounded-xl before:z-[-1] before:backdrop-blur-md before:opacity-60"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            rotateX.set(-(y - rect.height / 2) / 10);
            rotateY.set((x - rect.width / 2) / 10);
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
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
          />
        </div>
        <motion.div
          className="w-full md:w-1/2"
          initial={{ x: 100, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 leading-snug">
            Master Your <span className="text-blue-400">Work Rhythm</span>,<br />
            Unlock <span className="text-purple-400">Peak Productivity</span>
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Focusift tracks your focus patterns, detects your most productive hours, and gives smart reminders—so you can work with intention, not just habit.
          </p>
        </motion.div>
      </section>

      <section className="bg-[#292525] text-white py-24 text-center w-full">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold mb-10">Report a Bug!</h2>
          <div className="text-left text-gray-400 text-base leading-relaxed">
            <p className="mb-6 flex items-start gap-3">
              <FaBug className="text-white text-xl mt-1" />
              <span><strong className="text-white">Raise an issue on the repository</strong><br />
                If you encounter any bugs or issues while using Focusift, please raise an issue on the repository so our team can investigate and address the problem.</span>
            </p>
            <p className="flex items-start gap-3">
              <FaCodeBranch className="text-white text-xl mt-1" />
              <span><strong className="text-white">Contribute to the repository</strong><br />
                If you have the skills and expertise to fix bugs or improve Focusift, we welcome your contributions. Submit a pull request with your changes!</span>
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-10">
            <a
              href="https://github.com/Joshna907/codexy/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
            >
              Raise an Issue
            </a>
            <a
              href="https://github.com/Joshna907/codexy"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
            >
              Contribute
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#0A0A23] text-white text-center py-10">
        <h3 className="text-2xl font-bold mb-4 tracking-wide">Focusift</h3>
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
