"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import {
  ArrowRight,
  BarChartIcon as ChartBar,
  Shield,
  Zap,
} from "lucide-react";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (backgroundRef.current) {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth) * 100;
        const y = (clientY / window.innerHeight) * 100;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div
        ref={backgroundRef}
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 99, 71, 0.4) 0%, rgba(255, 140, 0, 0.2) 40%, rgba(25, 25, 35, 1) 100%)`,
        }}
      />

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
          className="flex flex-col items-center text-center mb-24"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-6 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-300"
          >
            <span className="text-sm font-medium">
              AI-Powered Finance Management
            </span>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500"
          >
            Smart Finance, <br />
            Smarter Decisions
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl mb-10"
          >
            Take control of your finances with AI-powered insights that help you
            save more, spend wisely, and build wealth effortlessly.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(255, 99, 71, 0.7)",
              }}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(255,99,71,0.5)]"
            >
              Get Started <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium"
            >
              See Demo
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section id="features" variants={itemVariants} className="mb-24 scroll-mt-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              Powerful Features
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
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
                  boxShadow: "0 0 20px rgba(255, 99, 71, 0.3)",
                }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex flex-col items-center text-center transition-all"
              >
                <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Testimonials */}
        <motion.section variants={itemVariants} className="mb-24">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
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
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all"
              >
                <p className="text-gray-300 mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
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
            className="p-10 rounded-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg border border-orange-500/30 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of users who have already improved their financial
              health with our AI-powered platform.
            </p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(255, 99, 71, 0.7)",
              }}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center justify-center gap-2 mx-auto shadow-[0_0_10px_rgba(255,99,71,0.5)]"
            >
              Get Started Today <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="text-center text-gray-400 text-sm py-6 border-t border-white/10"
        >
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Contact
            </a>
          </div>
          <p>© {new Date().getFullYear()} FinanceAI. All rights reserved.</p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
