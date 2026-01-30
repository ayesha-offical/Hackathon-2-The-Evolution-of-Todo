'use client';

import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS } from '@/config/animations';

export default function Home() {
  return (
    <motion.main
      className="page-container flex min-h-screen flex-col items-center justify-center p-6 sm:p-24"
      variants={ANIMATION_VARIANTS.listContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center max-w-2xl">
        <motion.h1
          className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          Todo Fusion
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-text-secondary mb-8"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          Full-stack todo application with JWT authentication
        </motion.p>

        <motion.div
          className="space-y-4 mb-12"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          <p className="text-success-light font-semibold">
            ✅ Frontend setup complete!
          </p>
          <p className="text-sm text-text-muted">
            Start managing your tasks with TodoFusion
          </p>
        </motion.div>

        <motion.div
          className="mt-12 space-y-3"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm font-mono bg-background-elevated/80 backdrop-blur-sm border border-border p-4 rounded-lg">
            API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}
          </p>
          <p className="text-xs text-text-muted">
            Backend running on http://localhost:8000
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
