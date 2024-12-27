"use client";

import { motion } from "framer-motion";

export default function AnimatedText({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const initialAnimations = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

  return (
    <motion.span
      className={className}
      aria-hidden
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: 1, staggerChildren: 0.1 }}
    >
      {text.split("").map((char, index) => (
        <motion.span key={`tagline-char-${index}`} variants={initialAnimations}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
