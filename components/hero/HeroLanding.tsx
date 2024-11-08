"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import paperPlane from "@/public/animations/paper-plane-shadow.json";
import dynamic from "next/dynamic";
import { LottieRefCurrentProps } from "lottie-react";
import AnimatedText from "./AnimatedText";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/**
 * HeroLanding component for the main landing page
 * Includes animated text and lottie animations
 */
const HeroLanding = () => {
  const controls = useAnimation();
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 },
  };

  const transition = {
    duration: 1,
    delay: 0.5,
  };

  /**
   * Starts animation when component mounts
   */
  useEffect(() => {
    controls.start(variants.visible);
  }, []);

  return (
    <div className="flex flex-col bg-[#ddb268] rounded-b-3xl items-start text-start min-w-[100dvw] h-[100dvh] font-sans font-semibold text-2xl p-24 text-[#251F1F]">
      {/* Main Title Section */}
      <div className="min-w-[65%] h-full">
        <motion.h1
          initial={variants.hidden}
          animate={controls}
          transition={transition}
          className="pt-[50px] desktop:text-8xl text-4xl font-bold"
        >
          Going for a trip?
        </motion.h1>

        <AnimatedText
          text="Leave the planning to us"
          className="pt-[10px] text-4xl font-light"
        />
      </div>

      {/* Animation Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-end justify-end w-full h-full"
      >
        <Lottie
          animationData={paperPlane}
          lottieRef={lottieRef}
          loop
          autoplay
          className="w-[600px] h-[600px]"
        />
      </motion.div>
    </div>
  );
};

export default HeroLanding;
