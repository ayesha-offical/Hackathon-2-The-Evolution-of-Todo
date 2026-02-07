// Task T011: Modernized FeaturesSection component
// Theme: High-end SaaS Blue/Cyan with interactive glass cards
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { SPRING_CONFIGS } from '@/config/animations';

const features = [
  {
    icon: '🎯',
    title: 'Smart Focus',
    description: 'Organize tasks with focus modes and concentration tools to maximize productivity.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: '👥',
    title: 'User Isolation',
    description: 'Each user has their own secure workspace with complete data isolation.',
    color: 'from-cyan-400 to-blue-600'
  },
  {
    icon: '💾',
    title: 'Data Persistence',
    description: 'Your work is automatically saved and synced across all devices instantly.',
    color: 'from-blue-600 to-indigo-500'
  },
  {
    icon: '✨',
    title: 'Smooth Experience',
    description: 'Enjoy a polished interface with smooth animations and responsive design.',
    color: 'from-indigo-400 to-cyan-400'
  },
];

export default function FeaturesSection() {
  return (
    <motion.section
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#030712]"
      variants={fadeInVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-blue-500/5 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            variants={staggerItemVariants}
            className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase"
          >
            Capabilities
          </motion.div>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-white to-cyan-400 bg-clip-text text-transparent"
            variants={staggerItemVariants}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Powering Your Workflow
          </motion.h2>
          <motion.p
            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
            variants={staggerItemVariants}
          >
            FocusHub is packed with features designed to take the friction out of productivity.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
              variants={staggerItemVariants}
              whileHover={{ y: -8 }}
              transition={SPRING_CONFIGS.primary}
            >
              {/* Animated Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-3xl bg-gradient-to-br ${feature.color} bg-opacity-10 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500`}>
                <span className="drop-shadow-md">{feature.icon}</span>
              </div>

              <h3
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                {feature.description}
              </p>

              {/* Bottom Decorative Line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}