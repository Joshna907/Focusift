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

// ... (testimonials and features arrays unchanged)

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
      {/* Navbar omitted for brevity - same as before */}

      <div className="w-full overflow-x-hidden">
        <div className="flex gap-6 animate-scroll px-4 w-max whitespace-nowrap mb-5">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[250px] max-w-[200px] bg-[#a7e4e4]/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-md text-white whitespace-normal break-words">
              <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full mb-3 object-cover" />
              <p className="text-sm leading-relaxed mb-3">&quot;{t.message}&quot;</p>
              <h4 className="text-sm font-semibold text-blue-300">— {t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Everything else is unchanged */}

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
