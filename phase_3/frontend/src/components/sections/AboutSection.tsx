// Task T010: Modernized AboutSection
// Theme: Ultra-modern Dark with Cyan/Blue Glow effects
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerItemVariants } from '@/lib/animations';
import { SPRING_CONFIGS } from '@/config/animations';

const benefits = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Get things done faster with an interface that responds at the speed of thought.',
  },
  {
    icon: '🎯',
    title: 'Stay Focused',
    description: 'Eliminate digital clutter and zero-in on your most high-impact tasks.',
  },
  {
    icon: '🔄',
    title: 'Seamless Sync',
    description: 'Instant synchronization across desktop, tablet, and mobile devices.',
  },
  {
    icon: '📈',
    title: 'Track Progress',
    description: 'Visual analytics to help you understand and optimize your workflow.',
  },
];

export default function AboutSection() {
  return (
    <motion.section
      className="relative py-24 sm:py-32 overflow-hidden bg-[#030712]" // Deep dark background
      variants={fadeInVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {/* --- Modern Background Decor --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span 
            className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-4 block"
            variants={staggerItemVariants}
          >
            Efficiency Redefined
          </motion.span>
          <motion.h2
            className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-white to-cyan-400 bg-clip-text text-transparent"
            variants={staggerItemVariants}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Why FocusHub?
          </motion.h2>
          <motion.p
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
            variants={staggerItemVariants}
          >
            We don't just manage tasks; we curate your focus. Designed for the modern professional who values speed and clarity.
          </motion.p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Text Content */}
          <motion.div className="space-y-10" variants={staggerItemVariants}>
            <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-white mb-4">Modern Productivity</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Most tools are cluttered with features you'll never use. FocusHub is built on the principle of <b>intentionality</b>—giving you exactly what you need to succeed.
              </p>
              
              <div className="space-y-4">
                {[
                  'Clean, distraction-free interface',
                  'Keyboard-first navigation',
                  'End-to-end encrypted data'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Interactive Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={staggerItemVariants}
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-transparent border border-gray-700/50 hover:border-cyan-500/50 transition-all"
                whileHover={{ y: -10 }}
                transition={SPRING_CONFIGS.bouncy}
              >
                {/* Card Glow on Hover */}
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{benefit.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Section with Glass Effect */}
        <motion.div
          className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl"
          variants={staggerItemVariants}
        >
          {[
            { label: 'Uptime', val: '99.9%' },
            { label: 'Latency', val: '<80ms' },
            { label: 'Users', val: '50k+' },
            { label: 'Support', val: '24/7' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.val}
              </div>
              <div className="text-gray-500 text-sm uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}