import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Link } from "react-router-dom";

const Hero = forwardRef(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 z-0 flex w-full h-full flex-col items-center justify-center overflow-hidden rounded-md bg-transparent",
          className
        )}
        style={{ pointerEvents: 'none' }}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen h-full items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow */}
            <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[30%] rounded-full bg-blue-600/50 opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              initial={{ width: "8rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              animate={{ width: "16rem" }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-blue-500/60 blur-2xl"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              animate={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="absolute inset-auto right-1/2 top-0 h-56 w-[30rem] overflow-visible"
              style={{
                backgroundImage: `conic-gradient(from 70deg at center top, rgba(59, 130, 246, 0.4), transparent, transparent)`,
              }}
            >
              <div className="absolute w-full left-0 bg-[#f8faff] dark:bg-black h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute w-40 h-full left-0 bg-[#f8faff] dark:bg-black bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              animate={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="absolute inset-auto left-1/2 top-0 h-56 w-[30rem]"
              style={{
                backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, rgba(59, 130, 246, 0.4))`,
              }}
            >
              <div className="absolute w-40 h-full right-0 bg-[#f8faff] dark:bg-black bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute w-full right-0 bg-[#f8faff] dark:bg-black h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}
      </div>
    );
  }
);
Hero.displayName = "Hero";

export { Hero };
