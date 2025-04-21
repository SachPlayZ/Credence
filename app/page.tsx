"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import { FlipWords } from "@/components/ui/flip-words";
import {
  ArrowRight,
  BarChartIcon as ChartBar,
  Shield,
  Zap,
  Star,
  TrendingUp,
  AlertCircle,
  Check,
  DollarSign,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust the path based on your project structure

const words = ["smarter", "stronger", "simpler", "secure"];

const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Update dimensions on window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-5 opacity-60">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-500"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            opacity: Math.random() * 0.5 + 0.3,
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            y: [null, "-20vh"],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulated loading progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingProgress(100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.33, 1, 0.68, 1], // Custom easing for smoother motion
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  const timelineItems = [
    { icon: <Check />, text: "Connect your accounts" },
    { icon: <AlertCircle />, text: "Analyze your spending patterns" },
    { icon: <TrendingUp />, text: "Receive personalized insights" },
    { icon: <DollarSign />, text: "Start saving immediately" },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden relative">
      {/* Loading progress */}
      <AnimatePresence>
        {loadingProgress < 100 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
            className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-8"
            >
              <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center">
                <DollarSign className="w-14 h-14 text-orange-400" />
              </div>
            </motion.div>
            <div className="w-64">
              <Progress value={loadingProgress} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Grid overlay */}
      <div className="fixed inset-0 -z-5 bg-[url('/grid.svg')] bg-center opacity-10" />

      <Navbar />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 pt-24 pb-16"
      >
        {/* Hero Section */}
        <motion.section
          variants={itemVariants}
          className="flex flex-col items-center text-center mb-32"
          style={{
            marginTop: `${-scrollY * 0.2}px`, // Parallax effect
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-300"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" fill="currentColor" /> AI-Powered
              Finance Management
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-7xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-orange-400 via-red-500 to-pink-500"
          >
            Smart Finance <br />
            Smarter Decisions
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed"
          >
            <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
              Manage your finances&nbsp;
              <FlipWords words={words} /> <br />
              with Credence.
            </div>
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255, 99, 71, 0.8)",
              }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white font-medium flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 text-lg"
            >
              Get Started <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-lg hover:bg-white/15 transition-colors"
            >
              See Demo
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Timeline Section */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-32"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Four simple steps to financial freedom
            </p>
          </motion.div>

          <div className="relative flex justify-center mb-20">
            <div className="absolute left-1/2 h-full w-1 bg-gradient-to-b from-orange-500/80 to-red-500/80 transform -translate-x-1/2" />

            <div className="relative z-10">
              {timelineItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                  className={`flex items-center gap-6 mb-16 ${
                    idx % 2 === 0 ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1 max-w-sm">
                    <div
                      className={`p-6 rounded-2xl ${
                        idx % 2 === 0
                          ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                          : "bg-white/5"
                      } backdrop-blur-md border border-white/10`}
                    >
                      <p className="text-xl text-white">{item.text}</p>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    {item.icon}
                  </div>

                  <div className="flex-1 max-w-sm"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          variants={itemVariants}
          className="mb-24 scroll-mt-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">
              Powerful Features
            </h2>
            <p className="text-zinc-300 max-w-2xl mx-auto">
              Our AI-powered platform analyzes your spending habits and provides
              personalized recommendations.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Zap className="w-10 h-10 text-orange-400" />,
                title: "AI-Powered Insights",
                description:
                  "Get personalized financial insights based on your spending patterns and financial goals.",
              },
              {
                icon: <Shield className="w-10 h-10 text-orange-400" />,
                title: "Overspending Prevention",
                description:
                  "Receive real-time alerts when you're about to exceed your budget in any category.",
              },
              {
                icon: <ChartBar className="w-10 h-10 text-orange-400" />,
                title: "Smart Analytics",
                description:
                  "Visualize your financial health with intuitive charts and predictive analytics.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                className="glassmorphism rounded-2xl border border-zinc-800/50 flex flex-col items-center text-center transition-all orange-glow"
              >
                <div className="mb-4 mt-8 p-4 rounded-full bg-zinc-800/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-zinc-300 px-6 pb-8">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          id="testimonials"
          variants={itemVariants}
          className="mb-24 scroll-mt-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">
              What Our Users Say
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                quote:
                  "This app has completely transformed how I manage my finances. The AI insights are incredibly accurate!",
                name: "Sarah Johnson",
                title: "Marketing Director",
              },
              {
                quote:
                  "I've saved over $3,000 in the last 6 months thanks to the overspending prevention feature.",
                name: "Michael Chen",
                title: "Software Engineer",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
                className="glassmorphism rounded-2xl border border-zinc-800/50 p-6 transition-all orange-glow"
              >
                <p className="text-zinc-300 mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-zinc-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section variants={itemVariants} className="mb-24">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glassmorphism rounded-2xl border border-orange-500/30 p-10 text-center orange-glow transition-shadow"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
              Join thousands of users who have already improved their financial
              health with our AI-powered platform.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="orange-gradient orange-glow transition-shadow flex items-center gap-2 text-base"
              >
                Get Started Today <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="text-center text-zinc-400 text-sm py-6 border-t border-zinc-800/50"
        >
          <div className="flex justify-center gap-6 mb-4">
            <Link href="#" className="hover:text-orange-400 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-orange-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-orange-400 transition-colors">
              Contact
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Credence. All rights reserved.</p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
