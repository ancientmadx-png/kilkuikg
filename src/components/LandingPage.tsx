import {
  Shield, Globe, Lock, Zap, CheckCircle, ArrowRight,
  GraduationCap, Building2, Users
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/* ================= COUNTER ================= */
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    let raf = 0;

    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ================= PARTICLES (FIXED) ================= */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    });

    const particles = Array.from({ length: 140 }).map(() => {
      const depth = Math.random();
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: depth * 2.5 + 0.6,
        dx: (Math.random() - 0.5) * (1 + depth * 2),
        dy: (Math.random() - 0.5) * (1 + depth * 2),
        depth,
        wave: Math.random() * Math.PI * 2
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.wave += 0.03;
        p.y += Math.sin(p.wave) * 0.4;

        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          p.x -= dx * 0.015 * p.depth;
          p.y -= dy * 0.015 * p.depth;
        }

        p.x += p.dx * 1.6;
        p.y += p.dy * 1.6;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,199,0,${0.25 + p.depth * 0.5})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

/* ================= MAIN PAGE ================= */
export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const icons = [Shield, Zap, Globe, Lock, Users, CheckCircle];

  return (
    <div className="relative bg-[#0A0A0A] text-white min-h-screen">
      <ParticleBackground />

      {/* HERO */}
      <motion.section
        style={{ y: heroY }}
        className="relative z-10 py-32 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold"
        >
          ZK LEDGER
          <span className="block text-[#FFC700] mt-4">
            Blockchain Verification
          </span>
        </motion.h1>

        <p className="mt-6 max-w-3xl mx-auto text-[#BFBFBF] text-lg">
          Secure, immutable and instantly verifiable academic credentials powered by blockchain technology.
        </p>

        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-10 py-4 rounded-xl bg-[#FFC700] text-black font-bold
              shadow-[0_0_80px_rgba(255,199,0,0.7)]"
          >
            Get Started <ArrowRight className="inline ml-2" />
          </motion.button>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -15, rotateX: 6, rotateY: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#141414] border border-[#2A2A2A]
                rounded-2xl p-10
                shadow-[0_0_60px_rgba(255,199,0,0.25)]"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFC700]
                flex items-center justify-center mb-6 shadow-xl">
                <Icon className="text-black w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Feature {i + 1}
              </h3>
              <p className="text-[#BFBFBF]">
                Tamper-proof, secure and globally verifiable blockchain credentials.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-24 border-t border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[100, 99, 0].map((v, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="text-4xl font-extrabold text-[#FFC700]">
                <AnimatedCounter target={v} />{i < 2 ? '%' : '+'}
              </div>
              <p className="mt-2 text-[#BFBFBF]">
                {i === 0 ? 'Security' : i === 1 ? 'Uptime' : 'Breaches'}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
